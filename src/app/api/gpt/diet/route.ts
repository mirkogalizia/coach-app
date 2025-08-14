// ✅ src/app/api/gpt/diet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import OpenAI from "openai";

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
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 });

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { anamnesi } = await req.json();
    console.log("📥 Anamnesi ricevuta:", anamnesi);

    const prompt = `Crea una dieta settimanale dettagliata per aumento massa muscolare sulla base di questi dati: ${JSON.stringify(anamnesi)}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });

    const dieta = completion.choices[0].message.content;
    console.log("✅ Dieta generata:", dieta);

    await db.collection("users").doc(uid).collection("diets").add({
      dieta,
      createdAt: new Date(),
      anamnesi,
    });

    return NextResponse.json({ ok: true, data: dieta });
  } catch (error: any) {
    console.error("❌ Errore API:", error);
    return NextResponse.json({ ok: false, error: error.message || "Errore interno" }, { status: 500 });
  }
}