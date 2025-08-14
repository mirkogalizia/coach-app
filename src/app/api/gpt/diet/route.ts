import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth as getClientAuth } from "firebase/auth";
import OpenAI from "openai";
import { auth as clientAuth, db } from "@/lib/firebase";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await clientAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await req.json();
    let { anamnesi } = body;

    if (!anamnesi) {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (!snap.exists() || !snap.data()?.anamnesi) {
        return NextResponse.json({ ok: false, error: "Anamnesi non trovata" }, { status: 400 });
      }
      anamnesi = snap.data().anamnesi;
    }

    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dieta = completion.choices[0].message.content;

    const userRef = doc(db, "users", uid);
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