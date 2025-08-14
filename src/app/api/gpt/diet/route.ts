import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import OpenAI from "openai";

// 🔐 Inizializza Firebase Admin solo una volta
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
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 });

    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { anamnesi } = await req.json();
    console.log("📥 Anamnesi:", anamnesi);

    const prompt = `Crea una dieta dettagliata per aumento massa sulla base di questi dati: ${JSON.stringify(anamnesi)}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dieta = completion.choices[0].message.content;
    console.log("✅ Dieta:", dieta);

    await db.collection("users").doc(uid).collection("diets").add({
      dieta,
      anamnesi,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, data: dieta });
  } catch (error: any) {
    console.error("❌ Errore diet:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}