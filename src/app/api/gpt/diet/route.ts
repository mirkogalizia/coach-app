// /src/app/api/gpt/diet/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import OpenAI from "openai";
import { db } from "@/lib/firebase";

if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const userInfo = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
    const uid = userInfo.user_id;

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    const data = snap.data();
    const anamnesi = data?.anamnesi;

    if (!anamnesi || !anamnesi.eta || !anamnesi.sesso || !anamnesi.obiettivo || !anamnesi.dieta) {
      return NextResponse.json({ ok: false, error: "Anamnesi incompleta o non trovata" }, { status: 400 });
    }

    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}. La dieta deve essere strutturata con 7 giorni, ognuno con colazione, spuntini, pranzo e cena. Presenta il contenuto in formato markdown con sezioni ben separate per ogni giorno.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dieta = completion.choices[0].message.content;

    await updateDoc(ref, {
      dieta,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true, data: dieta });
  } catch (err: any) {
    console.error("Errore generazione dieta:", err);
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 });
  }
}