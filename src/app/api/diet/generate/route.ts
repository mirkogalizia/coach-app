// NEXT: ultra-simple diet generator using OFF v2
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

/** ---- Types ---- */
type Nutriments = {
  ["energy-kcal_100g"]?: number;
  ["energy_100g"]?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  salt_100g?: number;
};
type OFFProduct = {
  code: string;
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
  image?: string | null;
  per100: { kcal: number; p: number; c: number; f: number };
};

type Meal = {
  name: string;
  items: Array<Item & { grams: number }>;
  macros: { kcal: number; p: number; c: number; f: number };
};

type DayPlan = {
  date: string;
  meals: Meal[];
  totals: { kcal: number; p: number; c: number; f: number };
};

/** ---- Helpers ---- */
function kcalFrom(n: Nutriments | undefined): number | null {
  if (!n) return null;
  if (typeof n["energy-kcal_100g"] === "number") return Math.round(n["energy-kcal_100g"]!);
  if (typeof n["energy_100g"] === "number") return Math.round(n["energy_100g"]! * 0.23900573614);
  return null;
}

function normalize(p: OFFProduct): Item | null {
  const kcal = kcalFrom(p.nutriments);
  const p100 = p.nutriments?.proteins_100g ?? null;
  const c100 = p.nutriments?.carbohydrates_100g ?? null;
  const f100 = p.nutriments?.fat_100g ?? null;
  if (kcal == null || p100 == null || c100 == null || f100 == null) return null;
  return {
    code: p.code,
    name: p.product_name_it || p.product_name || "Prodotto",
    image: p.image_url || null,
    per100: { kcal, p: p100, c: c100, f: f100 },
  };
}

function withGrams(base: Item, grams: number): Item & { grams: number } {
  return { ...base, grams };
}

function sumMeal(items: Array<Item & { grams: number }>): Meal["macros"] {
  const x = items.reduce(
    (acc, it) => {
      const k = it.per100.kcal * (it.grams / 100);
      const p = it.per100.p * (it.grams / 100);
      const c = it.per100.c * (it.grams / 100);
      const f = it.per100.f * (it.grams / 100);
      return { kcal: acc.kcal + k, p: acc.p + p, c: acc.c + c, f: acc.f + f };
    },
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
  return {
    kcal: Math.round(x.kcal),
    p: Math.round(x.p),
    c: Math.round(x.c),
    f: Math.round(x.f),
  };
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const resp = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    return resp;
  } finally {
    clearTimeout(id);
  }
}

async function offPickFirst(categoryEn: string): Promise<Item | null> {
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("categories_tags_en", categoryEn);
  url.searchParams.set("fields", "code,product_name,product_name_it,image_url,nutriments,categories_tags,nova_group");
  url.searchParams.set("sort_by", "unique_scans_n");
  url.searchParams.set("page_size", "10");

  const resp = await fetchWithTimeout(
    url.toString(),
    { headers: { "User-Agent": process.env.OFF_USER_AGENT || "coach-app/1.0" } },
    8000
  );

  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    console.error("OFF v2 failed:", resp.status, txt.slice(0, 300));
    return null;
  }

  const data = (await resp.json()) as OFFSearchResponse;
  const list = (data.products || [])
    // filtri minimi: nova_group <= 2 e sale non alto
    .filter((p) => (p.nova_group ?? 2) <= 2)
    .filter((p) => (p.nutriments?.salt_100g ?? 0) <= 2)
    .map(normalize)
    .filter((x): x is Item => x !== null);

  return list[0] ?? null;
}

/** ---- Routes ---- */
export async function GET() {
  return NextResponse.json({
    use: "POST /api/diet/generate",
    example: {
      days: 1,
      lunchGrams: 200,
      dinnerGrams: 200,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const days = typeof body.days === "number" && body.days > 0 ? Math.min(body.days, 7) : 1;
    const lunchGrams = typeof body.lunchGrams === "number" ? body.lunchGrams : 200;
    const dinnerGrams = typeof body.dinnerGrams === "number" ? body.dinnerGrams : 200;

    // categorie semplici: pollo a pranzo, salmone a cena
    const chicken = await offPickFirst("chicken-meat");
    const salmon = await offPickFirst("salmon");

    if (!chicken || !salmon) {
      return NextResponse.json(
        { error: "No products found from OFF v2 for chicken/salmon" },
        { status: 502 }
      );
    }

    const buildDay = (offset: number): DayPlan => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const date = d.toISOString().slice(0, 10);

      const lunchItems = [withGrams(chicken, lunchGrams)];
      const dinnerItems = [withGrams(salmon, dinnerGrams)];

      const lunch: Meal = { name: "Pranzo", items: lunchItems, macros: sumMeal(lunchItems) };
      const dinner: Meal = { name: "Cena", items: dinnerItems, macros: sumMeal(dinnerItems) };

      const totals = {
        kcal: lunch.macros.kcal + dinner.macros.kcal,
        p: lunch.macros.p + dinner.macros.p,
        c: lunch.macros.c + dinner.macros.c,
        f: lunch.macros.f + dinner.macros.f,
      };

      return { date, meals: [lunch, dinner], totals };
    };

    const week: DayPlan[] = Array.from({ length: days }, (_, i) => buildDay(i));
    return NextResponse.json({ ok: true, days, week });
  } catch (e) {
    console.error("generate POST exception:", e);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}