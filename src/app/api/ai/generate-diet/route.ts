import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { anamnesi } = await req.json();
    console.log("📥 Anamnesi ricevuta:", anamnesi);

    const prompt = `
Sei un nutrizionista esperto. In base ai seguenti dati:
${JSON.stringify(anamnesi)}

Genera una dieta settimanale dettagliata sotto forma di oggetto JSON. Ogni giorno deve avere:
- "date": nome del giorno (es: "Lunedì", "Martedì", ecc.)
- "meals": un array di pasti con:
    - "name": nome del pasto (es: "Colazione", "Pranzo", "Cena")
    - "items": un array di alimenti con:
        - "name": nome dell'alimento
        - "grams": quantità in grammi (es. 150)
        - "per100": valori nutrizionali per 100g, come:
            - "p": proteine
            - "c": carboidrati
            - "f": grassi

Rispondi solo con l’oggetto JSON. Nessuna spiegazione, nessun testo extra.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
    });

    const raw = completion.choices[0].message.content;

    // Proviamo a fare il parsing del JSON restituito
    let dietaJson = null;
    try {
      dietaJson = JSON.parse(raw || "");
    } catch (e) {
      console.error("❌ Errore nel parsing del JSON:", e);
      return NextResponse.json({ ok: false, error: "Formato risposta non valido" }, { status: 500 });
    }

    console.log("✅ Dieta JSON strutturata generata");

    return NextResponse.json({ ok: true, data: dietaJson });
  } catch (error: any) {
    console.error("❌ Errore durante la generazione dieta:", error);
    return NextResponse.json({ ok: false, error: error.message || "Errore interno" }, { status: 500 });
  }
}