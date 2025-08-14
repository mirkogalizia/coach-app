import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { anamnesi } = await req.json();

    const prompt = `Crea una dieta settimanale dettagliata per il seguente utente: ${JSON.stringify(anamnesi)}. Rispondi con un testo strutturato.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const output = completion.choices[0].message.content;
    return NextResponse.json({ ok: true, data: output });
  } catch (e: any) {
    console.error("Errore generazione dieta:", e);
    return NextResponse.json({ ok: false, error: e.message || "Errore" });
  }
}