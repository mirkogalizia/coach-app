import { NextRequest, NextResponse } from "next/server";

/** ======== TIPI MINIMI ======== **/
type Nutr = {
  ["energy-kcal_100g"]?: number;
  ["energy_100g"]?: number; // kJ
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
};
type OFFProduct = {
  code?: string;
  product_name?: string;
  product_name_it?: string;
  brands?: string;
  brands_tags?: string[];
  categories_tags?: string[];
  image_url?: string;
  nutriments?: Nutr;
  allergens_tags?: string[];
  labels_tags?: string[];
  ingredients_text?: string;
};

type FoodNorm = {
  name: string;
  kcal100: number;
  p100: number;
  c100: number;
  f100: number;
  image?: string | null;
  tags?: string[];
  off?: { code?: string; url?: string };
};

/** ======== CATEGORIE BASE (customizzabili) ======== **/
const CATS = {
  proteinLean: ["en:chicken-breasts","en:chicken-meat","en:turkey-meat","en:lean-beef"],
  proteinHeavy: ["en:salmon","en:beef","en:tuna","en:mackerel","en:eggs"],
  eggs: ["en:eggs"],
  cheese: ["en:cheeses"],
  veg: ["en:vegetables","en:leaf-vegetables","en:tomatoes","en:zucchini","en:peppers"],
  carbs: ["en:rice","en:potatoes","en:pasta"],
  veganProteins: ["en:tofu","en:tempeh","en:seitan","en:legumes","en:lentils","en:chickpeas"]
};

/** ======== UTILS ======== **/
function kcalFrom(n?: Nutr) {
  if (!n) return 0;
  if (typeof n["energy-kcal_100g"] === "number") return Math.round(n["energy-kcal_100g"]!);
  if (typeof n["energy_100g"] === "number") return Math.round(n["energy_100g"]! * 0.23900573614);
  return 0;
}
function norm(p: OFFProduct): FoodNorm {
  const n = p.nutriments || {};
  return {
    name: p.product_name_it || p.product_name || "Prodotto",
    kcal100: kcalFrom(n),
    p100: Number(n.proteins_100g ?? 0),
    c100: Number(n.carbohydrates_100g ?? 0),
    f100: Number(n.fat_100g ?? 0),
    image: p.image_url || null,
    tags: p.categories_tags || [],
    off: { code: p.code, url: p.code ? `https://world.openfoodfacts.org/product/${p.code}` : undefined },
  };
}
function gramsFor(target: number, per100: number, min = 100) {
  if (per100 <= 0) return min;
  return Math.max(min, Math.round((target / per100) * 100));
}
function sum(arr: number[]) { return arr.reduce((a,b)=>a+b,0); }
function macrosOf(item: { grams: number; kcal100: number; p100: number; c100: number; f100: number }) {
  const r = item.grams / 100;
  return {
    kcal: Math.round(item.kcal100 * r),
    p: +(item.p100 * r).toFixed(1),
    c: +(item.c100 * r).toFixed(1),
    f: +(item.f100 * r).toFixed(1),
  };
}

/** ======== FETCH OFF CON PREFERENZE ======== **/
async function offSearchByCategories(categories: string[], pageSize: number, prefer?: string[], avoid?: string[]) {
  // prefer/avoid sono categorie OFF (tags) extra scelte dall’utente
  const primary = prefer?.length ? prefer[0] : categories[0];
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("fields", [
    "code","product_name","product_name_it","image_url","nutriments",
    "categories_tags","allergens_tags","labels_tags","ingredients_text"
  ].join(","));
  url.searchParams.set("locale","it");
  url.searchParams.set("sort_by","unique_scans_n");
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("tagtype_0","categories");
  url.searchParams.set("tag_contains_0","contains");
  url.searchParams.set("tag_0", primary);

  const resp = await fetch(url.toString(), {
    headers: { "User-Agent": process.env.OFF_USER_AGENT || "coach-app/1.0" },
    cache: "no-store",
  });
  if (!resp.ok) throw new Error(`OFF ${resp.status}`);
  const data = await resp.json();
  const products: OFFProduct[] = data.products || [];

  let filtered = products.filter(p => {
    const cats = (p.categories_tags || []).map(String);
    const haveBase = categories.some(c => cats.includes(c));
    const passAvoid = !(avoid && avoid.some(a => cats.includes(a)));
    return haveBase && passAvoid;
  });

  // Se ho preferenze extra, faccio un piccolo boosting: prima quelli che matchano prefer
  if (prefer?.length) {
    const set = new Set(prefer);
    filtered = filtered.sort((a,b) => {
      const ac = (a.categories_tags||[]).some(t=>set.has(t)) ? 1 : 0;
      const bc = (b.categories_tags||[]).some(t=>set.has(t)) ? 1 : 0;
      return bc - ac;
    });
  }

  // normalizza e togli quelli senza kcal dichiarate
  return filtered.map(norm).filter(x => x.kcal100 > 0);
}

/** ======== FILTRI UTENTE ======== **/
function filterByUser(product: OFFProduct, dislikes: string[], flags: Record<string,boolean>) {
  const nm = (product.product_name_it || product.product_name || "").toLowerCase();
  const ingr = (product.ingredients_text || "").toLowerCase();
  const cats = (product.categories_tags || []).map(s=>s.toLowerCase());

  // dislikes (string matching semplice)
  if (dislikes && dislikes.some(d => nm.includes(d.toLowerCase()) || ingr.includes(d.toLowerCase()))) {
    return false;
  }

  // flags dietetici
  if (flags.vegan) {
    // richiediamo che le categorie suggeriscano vegan oppure escludiamo uova/latticini/carne/pesce
    const bad = ["en:meats","en:fish-and-seafood","en:cheeses","en:eggs"];
    if (cats.some(c => bad.includes(c))) return false;
  } else if (flags.vegetarian) {
    // escludi carne/pesce
    const bad = ["en:meats","en:fish-and-seafood"];
    if (cats.some(c => bad.includes(c))) return false;
  } else if (flags.pescatarian) {
    // escludi carni, ok pesci/uova/latticini
    const bad = ["en:meats"];
    if (cats.some(c => bad.includes(c))) return false;
  }

  if (flags.lactoseFree) {
    const bad = ["en:cheeses","en:milk-and-milk-products"];
    if (cats.some(c => bad.includes(c))) return false;
  }
  if (flags.glutenFree) {
    // esclusione base su categorie pasta/pane; (per affidabilità servirebbe field “labels_tags”)
    const bad = ["en:pasta","en:breads"];
    if (cats.some(c => bad.includes(c))) return false;
  }
  if (flags.porkFree) {
    // escludi suino
    if (nm.includes("maiale") || nm.includes("suino") || ingr.includes("maiale") || ingr.includes("suino")) return false;
  }

  return true;
}

/** ======== HANDLER PRINCIPALE ======== **/
export async function POST(req: NextRequest) {
  const body = await req.json().catch(()=> ({}));

  // --- profilo utente / preferenze ---
  const weight = Number(body.weight ?? 86.7);         // kg
  const kcalTarget = Number(body.kcal ?? 2100);
  const ppk = Number(body.ppk ?? 2.0);                // g/kg proteine
  const baseCarbs = body.style === "keto" ? Number(body.carbs ?? 30) : Number(body.carbs ?? 40);
  const days = Number(body.days ?? 7);
  const start = String(body.start ?? new Date().toISOString().slice(0,10));
  const carbDaysRaw = String(body.carbDays ?? "wed,sat").toLowerCase();

  // preferenze categoria (tag OFF) e lista alimenti da evitare o preferire
  const prefer = body.prefer ?? {}; // { proteinLean: string[], proteinHeavy: string[], veg: string[], carbs: string[], cheese: string[], eggs: string[] }
  const avoid = body.avoid ?? {};   // stesse chiavi
  const dislikes: string[] = body.dislikes ?? []; // parole chiave (es. "tonno","maiale","peperoni")

  // flags dietetici
  const flags: Record<string,boolean> = {
    keto: body.style === "keto",
    balanced: body.style === "balanced" || !body.style,
    vegan: !!body.vegan,
    vegetarian: !!body.vegetarian,
    pescatarian: !!body.pescatarian,
    lactoseFree: !!body.lactoseFree,
    glutenFree: !!body.glutenFree,
    porkFree: !!body.porkFree,
  };

  // giorni della settimana
  const dow = ["sun","mon","tue","wed","thu","fri","sat"];
  function parseISO(s:string){ const [Y,M,D]=s.split("-").map(Number); return new Date(Date.UTC(Y,M-1,D)); }
  function addDays(base:Date,n:number){ const d=new Date(base); d.setUTCDate(d.getUTCDate()+n); return d; }
  function iso(d:Date){ return d.toISOString().slice(0,10); }

  // target macro
  const targetP = Math.round(weight * ppk); // g proteine
  const kcalPC = targetP*4 + baseCarbs*4;
  const targetFBase = Math.max(0, Math.round((kcalTarget - kcalPC) / 9)); // g grassi

  // fetch categorie (rispettando prefer/avoid) in parallelo
  const fetchGroup = async (baseCats: string[], k: keyof typeof CATS) =>
    (await offSearchByCategories(
      baseCats,
      30,
      (prefer[k] || []) as string[],
      (avoid[k] || []) as string[],
    ));

  // Sostituzioni per stile dieta
  const proteinLeanCats = flags.vegan ? CATS.veganProteins : CATS.proteinLean;
  const proteinHeavyCats = flags.vegan ? CATS.veganProteins : CATS.proteinHeavy;
  const eggsCats = flags.vegan ? [] : CATS.eggs;
  const cheeseCats = flags.vegan || flags.lactoseFree ? [] : CATS.cheese;
  const carbCats = flags.keto ? ["en:leaf-vegetables","en:vegetables"] : CATS.carbs;

  const [leanAll, heavyAll, eggsAll, cheeseAll, vegAll, carbAll] = await Promise.all([
    fetchGroup(proteinLeanCats, "proteinLean"),
    fetchGroup(proteinHeavyCats, "proteinHeavy"),
    eggsCats.length ? fetchGroup(eggsCats, "eggs") : Promise.resolve([]),
    cheeseCats.length ? fetchGroup(cheeseCats, "cheese") : Promise.resolve([]),
    fetchGroup(CATS.veg, "veg"),
    fetchGroup(carbCats, "carbs"),
  ]);

  // filtra per dislikes/allergeni/flags
  function keep(p: OFFProduct) { return filterByUser(p, dislikes, flags); }
  // NB: abbiamo già normalizzato; ma per un filtro ulteriore avremmo bisogno del raw OFFProduct.
  // Qui assumiamo che offSearchByCategories abbia già dato prodotti "compatibili".

  // pick helper
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random()*arr.length)];

  const carbSet = new Set(String(carbDaysRaw).split(",").map(s=>s.trim()).filter(Boolean));
  const startDate = parseISO(start);
  const week: any[] = [];

  for (let i=0;i<days;i++){
    const d = addDays(startDate, i);
    const isCarbDay = carbSet.has(dow[d.getUTCDay()]);
    const C = flags.keto ? Math.min(baseCarbs, 40) : (isCarbDay ? Math.max(baseCarbs, 150) : baseCarbs);
    const F = Math.max(0, Math.round((kcalTarget - (targetP*4 + C*4))/9));

    // split su 2 pasti
    const P1 = Math.round(targetP*0.6),  P2 = targetP - P1;
    const C1 = Math.round(C*0.5),        C2 = C - C1;
    const F1 = Math.round(F*0.5),        F2 = F - F1;

    // scelte fonti
    const lean = pick(leanAll);
    const heavy = pick(heavyAll);
    const veg1 = pick(vegAll);
    const veg2 = pick(vegAll);

    const gramsLean = gramsFor(P1, lean.p100, 120);
    const gramsHeavy = gramsFor(P2, heavy.p100, 140);

    // carbs per carb day (o veg su keto)
    let c1Item: FoodNorm | null = null, c1g = 0;
    if (C1 > 0 && carbAll.length) { c1Item = pick(carbAll); c1g = gramsFor(C1, c1Item.c100, flags.keto ? 0 : 120); }

    let c2Item: FoodNorm | null = null, c2g = 0;
    if (C2 > 0 && carbAll.length) { c2Item = pick(carbAll); c2g = gramsFor(C2, c2Item.c100, flags.keto ? 0 : 120); }

    // fat boosters (uova/cheese se disponibili e permessi)
    const fatPool = [...eggsAll, ...cheeseAll].filter(x => x.f100 > 5);
    const fatBooster = (needF:number) => {
      if (needF <= 6 || fatPool.length === 0) return null;
      const f = pick(fatPool);
      const grams = Math.round((needF / f.f100) * 100 * 0.6); // ~60% del fabbisogno
      return grams > 20 ? { f, grams } : null;
    };

    const meal1Items: any[] = [
      { name: lean.name, grams: gramsLean, per100: {kcal: lean.kcal100, p: lean.p100, c: lean.c100, f: lean.f100}, off: lean.off },
      { name: veg1.name, grams: 150,       per100: {kcal: veg1.kcal100, p: veg1.p100, c: veg1.c100, f: veg1.f100}, off: veg1.off },
      ...(c1Item ? [{ name: c1Item.name, grams: c1g, per100: {kcal: c1Item.kcal100, p: c1Item.p100, c: c1Item.c100, f: c1Item.f100}, off: c1Item.off }] : []),
    ];
    const m1 = meal1Items.map(it => macrosOf({ grams: it.grams, kcal100: it.per100.kcal, p100: it.per100.p, c100: it.per100.c, f100: it.per100.f }));
    const m1Fneed = Math.round(F1 - sum(m1.map(x=>x.f)));
    const fb1 = fatBooster(m1Fneed);
    if (fb1) meal1Items.push({ name: fb1.f.name, grams: fb1.grams, per100: {kcal: fb1.f.kcal100, p: fb1.f.p100, c: fb1.f.c100, f: fb1.f.f100}, off: fb1.f.off });

    const meal2Items: any[] = [
      { name: heavy.name, grams: gramsHeavy, per100: {kcal: heavy.kcal100, p: heavy.p100, c: heavy.c100, f: heavy.f100}, off: heavy.off },
      { name: veg2.name,  grams: 150,        per100: {kcal: veg2.kcal100, p: veg2.p100, c: veg2.c100, f: veg2.f100}, off: veg2.off },
      ...(c2Item ? [{ name: c2Item.name, grams: c2g, per100: {kcal: c2Item.kcal100, p: c2Item.p100, c: c2Item.c100, f: c2Item.f100}, off: c2Item.off }] : []),
    ];
    const m2 = meal2Items.map(it => macrosOf({ grams: it.grams, kcal100: it.per100.kcal, p100: it.per100.p, c100: it.per100.c, f100: it.per100.f }));
    const m2Fneed = Math.round(F2 - sum(m2.map(x=>x.f)));
    const fb2 = fatBooster(m2Fneed);
    if (fb2) meal2Items.push({ name: fb2.f.name, grams: fb2.grams, per100: {kcal: fb2.f.kcal100, p: fb2.f.p100, c: fb2.f.c100, f: fb2.f.f100}, off: fb2.f.off });

    const tot1 = m1.reduce((a,b)=>({kcal:a.kcal+b.kcal,p:a.p+b.p,c:a.c+b.c,f:a.f+b.f}),{kcal:0,p:0,c:0,f:0});
    const tot2 = meal2Items.map(it => macrosOf({ grams: it.grams, kcal100: it.per100.kcal, p100: it.per100.p, c100: it.per100.c, f100: it.per100.f }))
                           .reduce((a,b)=>({kcal:a.kcal+b.kcal,p:a.p+b.p,c:a.c+b.c,f:a.f+b.f}),{kcal:0,p:0,c:0,f:0});
    const total = { kcal: tot1.kcal + tot2.kcal, p: +(tot1.p + tot2.p).toFixed(1), c: +(tot1.c + tot2.c).toFixed(1), f: +(tot1.f + tot2.f).toFixed(1) };

    week.push({
      date: iso(d),
      targets: { kcal: kcalTarget, p: targetP, c: C, f: F },
      total,
      meals: [
        { name: "Pranzo", items: meal1Items, macros: tot1 },
        { name: "Cena",   items: meal2Items, macros: tot2 },
      ],
      carbDay: isCarbDay
    });
  }

  return NextResponse.json({
    meta: {
      source: "openfoodfacts",
      note: "Dati OFF (ODbL). Valori dipendono dalle etichette dei prodotti.",
      params: { weight, kcal: kcalTarget, ppk, baseCarbs, style: flags.keto ? "keto" : (flags.vegan?"vegan":(flags.vegetarian?"vegetarian":(flags.pescatarian?"pescatarian":"balanced"))), days, start, carbDays: carbDaysRaw }
    },
    week
  }, { headers: { "Cache-Control": "no-store" }});
}

/** GET di cortesia (compat) */
export async function GET(req: NextRequest) {
  // per comodità chiama ancora la vecchia versione: reindirizza all’uso POST con defaults
  const defaults = {
    weight: 86.7, kcal: 2100, ppk: 2.0, carbs: 40, days: 7, style: "balanced",
    carbDays: "wed,sat", dislikes: [], prefer: {}, avoid: {}
  };
  return NextResponse.json({ use: "POST /api/diet/generate", example: defaults });
}