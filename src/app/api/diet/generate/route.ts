export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

/** ——— Helpers semplici ——— */
function abortableFetch(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" })
    .finally(() => clearTimeout(id));
}

// kcal/100g: prova prima energy-kcal_100g, altrimenti converti da kJ
function kcalFrom(n: any): number | null {
  if (!n) return null;
  if (typeof n["energy-kcal_100g"] === "number") return Math.round(n["energy-kcal_100g"]);
  if (typeof n["energy_100g"] === "number") return Math.round(n["energy_100g"] * 0.23900573614);
  return null;
}

// Normalizza un prodotto OFF in un “item” utilizzabile
function toItem(p: any) {
  const n = p?.nutriments ?? {};
  const kcal = kcalFrom(n);
  const p100 = typeof n.proteins_100g === "number" ? n.proteins_100g : null;
  const c100 = typeof n.carbohydrates_100g === "number" ? n.carbohydrates_100g : null;
  const f100 = typeof n.fat_100g === "number" ? n.fat_100g : null;
  if (kcal == null || p100 == null || c100 == null || f100 == null) return null;
  return {
    code: String(p.code ?? ""),
    name: p.product_name_it || p.product_name || "Prodotto",
    image: p.image_url || null,
    per100: { kcal, p: p100, c: c100, f: f100 },
  };
}

// Somma macro di un array di item con grammi
function sumMeal(items: Array<any>) {
  const acc = items.reduce(
    (t, it) => {
      const f = it.grams / 100;
      t.kcal += it.per100.kcal * f;
      t.p    += it.per100.p    * f;
      t.c    += it.per100.c    * f;
      t.f    += it.per100.f    * f;
      return t;
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

// Prende il primo prodotto “pulito” da una categoria OFF v2
async function offPickFirst(categoryEn: string) {
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("categories_tags_en", categoryEn);
  url.searchParams.set("fields", "code,product_name,product_name_it,image_url,nutriments,categories_tags,nova_group");
  url.searchParams.set("sort_by", "unique_scans_n");
  url.searchParams.set("page_size", "10");

  const r = await abortableFetch(url.toString(), {
    headers: { "User-Agent": process.env.OFF_USER_AGENT || "coach-app/1.0" },
  }, 8000);

  if (!r.ok) {
    // log interno; non bloccare
    const txt = await r.text().catch(() => "");
    console.error("OFF v2 failed", r.status, txt.slice(0, 200));
    return null;
  }

  const data = await r.json();
  const list = Array.isArray(data?.products) ? data.products : [];

  // filtri minimi: poco processati e sale non alto
  const cleaned = list
    .filter((p: any) => (p?.nova_group ?? 2) <= 2)
    .filter((p: any) => (p?.nutriments?.salt_100g ?? 0) <= 2)
    .map(toItem)
    .filter(Boolean);

  return cleaned[0] ?? null;
}

/** ——— GET: mostra come usare la POST ——— */
export async function GET() {
  return NextResponse.json({
    use: "POST /api/diet/generate",
    example: { days: 1, lunchGrams: 200, dinnerGrams: 200 }
  });
}

/** ——— POST: genera 1..7 giorni con Pranzo (pollo) + Cena (salmone) ——— */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const days = typeof body.days === "number" && body.days > 0 ? Math.min(body.days, 7) : 1;
    const lunchGrams  = typeof body.lunchGrams  === "number" ? body.lunchGrams  : 200;
    const dinnerGrams = typeof body.dinnerGrams === "number" ? body.dinnerGrams : 200;

    // MOCK rapido (opzionale): se serve sbloccare subito
    if (process.env.DEBUG_DIET_MOCK === "1") {
      const mkDay = (i: number) => {
        const d = new Date(); d.setDate(d.getDate() + i);
        const date = d.toISOString().slice(0, 10);
        const chicken = { code: "mock1", name: "Petto di pollo", per100: { kcal: 165, p: 31, c: 0, f: 3.6 } };
        const salmon  = { code: "mock2", name: "Salmone",       per100: { kcal: 208, p: 20, c: 0, f: 13  } };
        const lunchItems  = [{ ...chicken, grams: lunchGrams  }];
        const dinnerItems = [{ ...salmon,  grams: dinnerGrams }];
        const lunch  = { name: "Pranzo", items: lunchItems,  macros: sumMeal(lunchItems) };
        const dinner = { name: "Cena",   items: dinnerItems, macros: sumMeal(dinnerItems) };
        return {
          date,
          meals: [lunch, dinner],
          totals: {
            kcal: lunch.macros.kcal + dinner.macros.kcal,
            p:    lunch.macros.p    + dinner.macros.p,
            c:    lunch.macros.c    + dinner.macros.c,
            f:    lunch.macros.f    + dinner.macros.f,
          }
        };
      };
      return NextResponse.json({ ok: true, days, week: Array.from({ length: days }, (_, i) => mkDay(i)) });
    }

    // LIVE: chiama OFF v2
    const [chicken, salmon] = await Promise.all([
      offPickFirst("chicken-meat"),
      offPickFirst("salmon"),
    ]);

    if (!chicken || !salmon) {
      return NextResponse.json(
        { error: "no_products", detail: { chicken: !!chicken, salmon: !!salmon } },
        { status: 502 }
      );
    }

    const makeDay = (i: number) => {
      const d = new Date(); d.setDate(d.getDate() + i);
      const date = d.toISOString().slice(0, 10);

      const lunchItems  = [{ ...chicken, grams: lunchGrams  }];
      const dinnerItems = [{ ...salmon,  grams: dinnerGrams }];

      const lunch  = { name: "Pranzo", items: lunchItems,  macros: sumMeal(lunchItems) };
      const dinner = { name: "Cena",   items: dinnerItems, macros: sumMeal(dinnerItems) };

      return {
        date,
        meals: [lunch, dinner],
        totals: {
          kcal: lunch.macros.kcal + dinner.macros.kcal,
          p:    lunch.macros.p    + dinner.macros.p,
          c:    lunch.macros.c    + dinner.macros.c,
          f:    lunch.macros.f    + dinner.macros.f,
        }
      };
    };

    const week = Array.from({ length: days }, (_, i) => makeDay(i));
    return NextResponse.json({ ok: true, days, week });
  } catch (e: any) {
    console.error("diet/generate exception:", e?.name, e?.message ?? String(e));
    // in dev puoi far trapelare l’errore:
    if (process.env.DEBUG_VERBOSE === "1") {
      return NextResponse.json({ error: "internal_error", message: String(e) }, { status: 500 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}