import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import OpenAI from "openai";
import { db } from "@/lib/firebase";

// Inizializza Firebase se non ancora fatto
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

    // Decodifica ID token via Firebase Auth REST API
    const decodedToken = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }).then(res => res.json());

    const uid = decodedToken?.users?.[0]?.localId;
    if (!uid) {
      return NextResponse.json({ ok: false, error: "Token non valido" }, { status: 401 });
    }

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      return NextResponse.json({ ok: false, error: "Utente non trovato" }, { status: 400 });
    }

    const data = snap.data();
    let anamnesi = data.anamnesi;

    if (
      !anamnesi ||
      !anamnesi.eta ||
      !anamnesi.sesso ||
      !anamnesi.obiettivo ||
      !anamnesi.dieta
    ) {
      return NextResponse.json({ ok: false, error: "Anamnesi incompleta o non trovata" }, { status: 400 });
    }

    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}. Dividi la dieta giorno per giorno, e per ogni giorno mostra Colazione, Spuntino, Pranzo, Spuntino, Cena.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dieta = completion.choices[0].message.content;

    await updateDoc(userRef, {
      dieta,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true, data: dieta });
  } catch (err: any) {
    console.error("Errore generazione dieta:", err);
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 });
  }
}