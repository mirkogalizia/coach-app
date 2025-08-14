// src/app/api/gpt/diet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import OpenAI from "openai";

// 🔐 Inizializza Firebase Admin (una sola volta)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // 🔐 Estrai ID token da Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, error: "Token mancante o non valido" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1].trim();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 📥 Ricevi anamnesi
    const { anamnesi } = await req.json();
    if (!anamnesi) {
      return NextResponse.json({ ok: false, error: "Anamnesi mancante" }, { status: 400 });
    }

    console.log("📥 Anamnesi ricevuta:", anamnesi);

    // 🤖 Chiamata GPT-4o
    const prompt = `Crea una dieta settimanale dettagliata per aumento massa muscolare sulla base di questi dati utente: ${JSON.stringify(anamnesi)}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Sei un nutrizionista esperto specializzato in sport." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const dieta = completion.choices[0].message.content?.trim();
    if (!dieta) {
      return NextResponse.json({ ok: false, error: "Nessuna dieta generata" }, { status: 500 });
    }

    console.log("✅ Dieta generata:", dieta.slice(0, 200) + "...");

    // 💾 Salva dieta su Firestore
    await db.collection("users").doc(uid).collection("diets").add({
      dieta,
      anamnesi,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, data: dieta });
  } catch (error: any) {
    console.error("❌ Errore diet route:", error);
    return NextResponse.json({ ok: false, error: error.message || "Errore interno" }, { status: 500 });
  }
}