import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const { anamnesi } = body;

  if (!anamnesi) {
    return NextResponse.json({ error: "Missing anamnesi" }, { status: 400 });
  }

  const prompt = `
Sei un nutrizionista esperto italiano. L’utente ha fornito questa anamnesi:

${JSON.stringify(anamnesi, null, 2)}

Genera un piano nutrizionale riepilogativo con queste informazioni:
- Obiettivo (es: dimagrimento, aumento massa, mantenimento)
- Ripartizione dei macronutrienti (grammi o % su base giornaliera)
- Suggerimenti per pranzo e cena (categorie proteiche, carboidrati, verdure)
- Consigli per la colazione
- Durata suggerita del piano (in giorni)

Rispondi in formato JSON:
{
  "obiettivo": string,
  "durata": number,
  "colazione": string,
  "pranzo": string,
  "cena": string,
  "macros": {
    "proteine": string,
    "carboidrati": string,
    "grassi": string
  }
}
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: "OpenAI error", detail: err }, { status: 500 });
    }

    const json = await res.json();
    const reply = json.choices[0]?.message?.content;

    const parsed = JSON.parse(reply);

    return NextResponse.json({ ok: true, data: parsed });
  } catch (e) {
    return NextResponse.json({ error: "internal_error", detail: String(e) }, { status: 500 });
  }
}