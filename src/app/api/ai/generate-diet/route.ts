import { NextResponse } from "next/server";
import { openai } from "@/lib/openai"; // Assicurati che questo import sia corretto
import type { AnamnesiData } from "@/types"; // Tipo opzionale, puoi usare anche `any`

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const anamnesi: AnamnesiData = body.anamnesi;

    if (!anamnesi) {
      return NextResponse.json({ ok: false, error: "Dati mancanti" }, { status: 400 });
    }

    // Costruzione del prompt per OpenAI
    const prompt = `Genera una dieta giornaliera basata su queste informazioni:\n${JSON.stringify(anamnesi, null, 2)}\n\nLa dieta deve includere colazione, spuntini, pranzo e cena.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // o gpt-3.5-turbo
      messages: [
        { role: "system", content: "Sei un nutrizionista professionista." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices?.[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json({ ok: false, error: "Nessuna risposta da OpenAI" }, { status: 500 });
    }

    // ✅ Risposta serializzabile, non una funzione
    return NextResponse.json({
      ok: true,
      data: responseText,
    });

  } catch (err) {
    console.error("Errore API /generate-diet:", err);
    return NextResponse.json({ ok: false, error: "Errore interno" }, { status: 500 });
  }
}