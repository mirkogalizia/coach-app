// /src/app/api/gpt/diet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import OpenAI from "openai";
import { db } from "@/lib/firebase";

// Inizializza Firebase se non già fatto
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
    const body = await req.json();
    const uid = body.uid;
    if (!uid) {
      return NextResponse.json({ ok: false, error: "UID mancante" }, { status: 400 });
    }

    let { anamnesi } = body;

    // Se anamnesi non è passata, prova a prenderla dal db
    if (!anamnesi) {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (!snap.exists() || !snap.data()) {
        return NextResponse.json({ ok: false, error: "Utente non trovato" }, { status: 404 });
      }
      const data = snap.data();
      anamnesi = {
        eta: data.eta,
        sesso: data.sesso,
        obiettivo: data.obiettivo,
        dieta: data.dieta,
        allergie: data.allergie,
      };
    }

    // Prompt OpenAI
    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dieta = completion.choices[0].message.content;

    // Salva nel Firestore
    const ref = doc(db, "users", uid);
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