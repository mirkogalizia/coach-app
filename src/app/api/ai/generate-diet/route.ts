// src/app/api/ai/generate-diet/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { anamnesi } = await req.json();
    console.log("📥 Anamnesi ricevuta:", anamnesi);

    const prompt = `Crea una dieta personalizzata in base ai seguenti dati: ${JSON.stringify(anamnesi)}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o", // oppure prova "gpt-3.5-turbo" se hai problemi
    });

    const dieta = completion.choices[0].message.content;
    console.log("✅ Dieta generata:", dieta);

    return NextResponse.json({ ok: true, data: dieta });
  } catch (error: any) {
    console.error("❌ Errore durante la chiamata a OpenAI:", error);
    return NextResponse.json({ ok: false, error: error.message || "Errore interno" });
  }
}