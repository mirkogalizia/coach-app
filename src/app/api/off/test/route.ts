export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function abortableFetch(url: string, init: RequestInit = {}, ms = 8000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" })
    .finally(() => clearTimeout(id));
}

export async function GET() {
  const url = new URL("https://world.openfoodfacts.org/api/v2/search");
  url.searchParams.set("categories_tags_en", "chicken-meat");
  url.searchParams.set("fields", "code,product_name,image_url,nutriments");
  url.searchParams.set("page_size", "5");

  try {
    const r = await abortableFetch(url.toString(), {
      headers: { "User-Agent": process.env.OFF_USER_AGENT || "coach-app/1.0" },
    }, 8000);

    const status = r.status;
    const txt = await r.text();
    if (!r.ok) {
      console.error("OFF test failed", status, txt.slice(0, 300));
      return Response.json({ ok: false, status, body: txt.slice(0, 300) }, { status: 502 });
    }
    const json = JSON.parse(txt);
    return Response.json({ ok: true, status, count: json?.products?.length ?? 0 });
  } catch (e: any) {
    console.error("OFF test exception", e?.name, e?.message);
    return Response.json({ ok: false, error: String(e) }, { status: 504 });
  }
}