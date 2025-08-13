// src/app/api/diet/generate/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

/* ================== Types ================== */
type Nutriments = {
  ["energy-kcal_100g"]?: number;
  ["energy_100g"]?: number; // kJ
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  salt_100g?: number;
};

type OFFProduct = {
  code?: string;
  product_name?: string;
  product_name_it?: string;
  image_url?: string;
  categories_tags?: string[];
  nutriments?: Nutriments;
  nova_group?: number;
};

type OFFSearchResponse = {
  products?: OFFProduct[];
};

type Item = {
  code: string;
  name: string;
  image: string | null;
  per100: { kcal: number; p: number; c: number; f: number };
};

type MealItem = Item & { grams: number };

type Meal = {
  name: string;
  items: MealItem[];
  macros: { kcal: number; p: number; c: number; f: number };
};

type DayPlan = {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  totals: { kcal: number; p: number; c: number; f: number };
};

type PickProfile = "chicken" | "salmon" | "lean-meat" | "fish";

/* ================== Utils ================== */
function abortableFetch(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" }).finally(() =>
    clearTimeout(id)
  );
}

function kcalFrom(n?: Nutriments): number | null {
  if (!n) return null;
  if (typeof n["energy-kcal_100g"] === "number") return Math.round(n["energy-kcal_100g"]!);
  if (typeof n["energy_100g"] === "number")
    return Math.round(n["energy_100g"]! * 0.23900573614); // kJ -> kcal
  return null;
}

function nz(x: number | undefined | null): number {
  return typeof x === "number" && Number.isFinite(x) ? x : 0;
}

function toItem(p: OFFProduct): Item | null {
  const kcal = kcalFrom(p.nutriments);
  if (kcal == null) return null;
  const name = p.product_name_it || p.product_name || "Prodotto";
  return {
    code: String(p.code ?? ""),
    name,
    image: p.image_url ?? null,
    per100: {
      kcal,
      p: nz(p.nutriments?.proteins_100g),
      c: nz(p.nutriments?.carbohydrates_100g),
      f: nz(p.nutriments?.fat_100g),
    },
  };
}

function withGrams(base: Item, grams: number): MealItem {
  return { ...base, grams };
}

function sumMeal(items: MealItem[]): Meal["macros"] {
  const acc = items.reduce(
    (t, it) => {
      const f = it.grams / 100;
      return {
        kcal: t.kcal + it.per100.kcal * f,
        p: t.p + it.per100.p * f,
        c: t.c + it.per100.c * f,
        f: t.f + it.per100.f * f,
      };
    },
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
  return {
    kcal: Math.round(acc.kcal),
    p: Math.round(acc.p),
    c: Math.round(acc.c),
    f: Math.round(acc.f),
  };
}

function matchTokens(s: string | undefined | null, tokens: string[]): boolean {
  if (!s) return false;
  const low = s.toLowerCase();
  return tokens.some((t) => low.includes(t));
}

function goodForProfile(p: OFFProduct, item: Item, prof: PickProfile): boolean {
  const cats = (p.categories_tags || []).map((c) => c.toLowerCase());
  const catStr = cats.join(" ");
  const prot = item.per100.p;
  const carb = item.per100.c;

  if (prof === "chicken") {
    const catOk =
      matchTokens(catStr, ["chicken", "poultr"]) ||
      matchTokens(p.product_name, ["chicken"]) ||
      matchTokens(p.product_name_it, ["pollo"]);
    return catOk && prot >= 15 && carb <= 5;
  }

  if (prof === "salmon") {
    const catOk =
      matchTokens(catStr, ["salmon"]) ||
      matchTokens(p.product_name, ["salmon"]) ||
      matchTokens(p.product_name_it, ["salmone"]);
    return catOk && prot >= 15 && carb <= 3;
  }

  if (prof === "lean-meat") {
    return (
      prot >= 18 &&
      carb <= 5 &&
      matchTokens(catStr, ["meat", "beef", "veal", "turkey", "chicken", "poultr"])
    );
  }

  if (prof === "fish") {
    return (
      prot >= 15 &&
      carb <= 3 &&
      matchTokens(catStr, ["fish", "salmon", "tuna", "cod", "merlu", "sgombro", "sardine"])
    );
  }

  return true;
}

/* ================== OFF picker robusto ================== */
async function offPickFirst(
  categoryEnOrList: string | string[],
  profile: PickProfile
): Promise<Item | null> {
  const categories = Array.isArray(categoryEnOrList) ? categoryEnOrList : [categoryEnOrList];

  const tryCategories = [
    ...categories,
    ...(profile === "chicken"
      ? ["chicken-breasts", "chickens", "cooked-chicken", "cooked-chicken-breast", "poultries"]
      : []),
    ...(profile === "salmon" ? ["salmon", "fishes"] : []),
  ];

  async function queryOnce(cat: string): Promise<Item | null> {
    const url = new URL("https://world.openfoodfacts.org/api/v2/search");
    url.searchParams.set("categories_tags_en", cat);
    url.searchParams.set(
      "fields",
      "code,product_name,product_name_it,image_url,nutriments,categories_tags,nova_group"
    );
    url.searchParams.set("sort_by", "unique_scans_n");
    url.searchParams.set("page_size", "30");

    const r = await abortableFetch(
      url.toString(),
      { headers: { "User-Agent": process.env.OFF_USER_AGENT || "coach-app/1.0" } },
      8000
    );
    if (!r.ok) return null;

    const data = (await r.json()) as OFFSearchResponse;
    const list = Array.isArray(data.products) ? data.products : [];

    const cleaned = list
      .filter((pr) => (pr.nova_group ?? 3) <= 3)
      .filter((pr) => (pr.nutriments?.salt_100g ?? 0) <= 3)
      .map(toItem)
      .filter((it, idx): it is Item => it !== null && goodForProfile(list[idx]!, it, profile));

    cleaned.sort((a, b) => (b.per100.p - a.per100.p) || (a.per100.c - b.per100.c));
    return cleaned[0] ?? null;
  }

  for (const cat of tryCategories) {
    try {
      const item = await queryOnce(cat);
      if (item) return item;
    } catch {
      // prova prossima categoria
    }
  }
  return null;
}

/* ================== Route ================== */
export async function GET() {
  return NextResponse.json({
    use: "POST /api/diet/generate",
    example: {
      days: 1,
      lunchGrams: 200,
      dinnerGrams: 200,
      lunchCategory: "chicken-meat",
      dinnerCategory: "salmon",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<{
      days: number;
      lunchGrams: number;
      dinnerGrams: number;
      lunchCategory: string | string[];
      dinnerCategory: string | string[];
    }>;

    const days = typeof body.days === "number" && body.days > 0 ? Math.min(body.days, 7) : 1;
    const lunchGrams = typeof body.lunchGrams === "number" ? body.lunchGrams : 200;
    const dinnerGrams = typeof body.dinnerGrams === "number" ? body.dinnerGrams : 200;

    const lunchCategory = body.lunchCategory ?? "chicken-meat";
    const dinnerCategory = body.dinnerCategory ?? "salmon";

    // Mock rapido (per test locali o se OFF è down)
    if (process.env.DEBUG_DIET_MOCK === "1") {
      const mk = (i: number): DayPlan => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const date = d.toISOString().slice(0, 10);

        const chicken: Item = {
          code: "mock1",
          name: "Petto di pollo",
          image: null,
          per100: { kcal: 165, p: 31, c: 0, f: 3.6 },
        };
        const salmon: Item = {
          code: "mock2",
          name: "Salmone",
          image: null,
          per100: { kcal: 208, p: 20, c: 0, f: 13 },
        };

        const lunchItems = [withGrams(chicken, lunchGrams)];
        const dinnerItems = [withGrams(salmon, dinnerGrams)];
        const lunch: Meal = { name: "Pranzo", items: lunchItems, macros: sumMeal(lunchItems) };
        const dinner: Meal = { name: "Cena", items: dinnerItems, macros: sumMeal(dinnerItems) };

        return {
          date,
          meals: [lunch, dinner],
          totals: {
            kcal: lunch.macros.kcal + dinner.macros.kcal,
            p: lunch.macros.p + dinner.macros.p,
            c: lunch.macros.c + dinner.macros.c,
            f: lunch.macros.f + dinner.macros.f,
          },
        };
      };
      return NextResponse.json({ ok: true, days, week: Array.from({ length: days }, (_, i) => mk(i)) });
    }

    // LIVE: pollo + salmone filtrati bene
    const [lunchItem, dinnerItem] = await Promise.all([
      offPickFirst(lunchCategory, "chicken"),
      offPickFirst(dinnerCategory, "salmon"),
    ]);

    if (!lunchItem || !dinnerItem) {
      return NextResponse.json(
        { error: "no_products", detail: { lunch: !!lunchItem, dinner: !!dinnerItem } },
        { status: 502 }
      );
    }

    const buildDay = (offset: number): DayPlan => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const date = d.toISOString().slice(0, 10);

      const lunchItems = [withGrams(lunchItem, lunchGrams)];
      const dinnerItems = [withGrams(dinnerItem, dinnerGrams)];

      const lunch: Meal = { name: "Pranzo", items: lunchItems, macros: sumMeal(lunchItems) };
      const dinner: Meal = { name: "Cena", items: dinnerItems, macros: sumMeal(dinnerItems) };

      return {
        date,
        meals: [lunch, dinner],
        totals: {
          kcal: lunch.macros.kcal + dinner.macros.kcal,
          p: lunch.macros.p + dinner.macros.p,
          c: lunch.macros.c + dinner.macros.c,
          f: lunch.macros.f + dinner.macros.f,
        },
      };
    };

    const week = Array.from({ length: days }, (_, i) => buildDay(i));
    return NextResponse.json({ ok: true, days, week });
  } catch (e) {
    const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error("diet/generate exception:", message);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}