// src/lib/off.ts
export type OFFItem = {
  code: string;
  name: string | null;
  image?: string | null;
  kcal100: number | null;
  p100: number | null;
  c100: number | null;
  f100: number | null;
  cats: string[];
};

function abortableFetch(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t));
}

export async function offSearchByCategory({
  categoryEn,
  pageSize = 15,
  minKcal = 1,
  maxSaltPer100g = 2,      // g/100g
  maxNovaGroup = 2,        // 1=raw,2=processed,3-4 ultra
}: {
  categoryEn: string;
  pageSize?: number;
  minKcal?: number;
  maxSaltPer100g?: number;
  maxNovaGroup?: number;
}): Promise<OFFItem[]> {
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("categories_tags_en", categoryEn);
  url.searchParams.set("fields", [
    "code","product_name","product_name_it","image_url","nutriments",
    "categories_tags","nova_group"
  ].join(","));
  url.searchParams.set("sort_by", "unique_scans_n");
  url.searchParams.set("page_size", String(Math.min(pageSize, 20)));

  const resp = await abortableFetch(url.toString(), {
    headers: { "User-Agent": process.env.OFF_USER_AGENT || "coach-app/1.0" },
    cache: "no-store",
  }, 8000);

  if (!resp.ok) throw new Error(`OFF ${resp.status} ${await resp.text().catch(()=> "")}`);

  const data = await resp.json() as any;
  const products = Array.isArray(data.products) ? data.products : [];

  const items: OFFItem[] = products.map((p: any) => {
    const n = p.nutriments || {};
    const kcal100 = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] * 0.23900573614 : null);
    return {
      code: p.code,
      name: p.product_name_it || p.product_name || null,
      image: p.image_url || null,
      kcal100: typeof kcal100 === "number" ? Math.round(kcal100) : null,
      p100: n.proteins_100g ?? null,
      c100: n.carbohydrates_100g ?? null,
      f100: n.fat_100g ?? null,
      cats: p.categories_tags || [],
    };
  })
  .filter((it) => (it.kcal100 ?? 0) >= minKcal)
  .filter((_, idx) => idx < pageSize)
  .filter((_, idx, arr) => arr[idx] != null);

  // filtri nutrizionali e di "processamento"
  return products
    .map((p: any, i: number) => ({ p, it: items[i] }))
    .filter(({ p, it }) => it && (p.nova_group ?? 2) <= maxNovaGroup)
    .filter(({ p }) => (p.nutriments?.salt_100g ?? 0) <= maxSaltPer100g)
    .map(({ it }) => it!);
}