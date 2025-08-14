// /src/app/api/gpt/diet/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth as getClientAuth } from "firebase/auth";
import OpenAI from "openai";
import { auth as clientAuth, db } from "@/lib/firebase";

// 🔐 Inizializza solo se necessario
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
    // 🔐 Estrai token Firebase dal client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await clientAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const firstName = decodedToken.name?.split(" ")[0] || "";
    const lastName = decodedToken.name?.split(" ")[1] || "";

    const { anamnesi } = await req.json();

    // 📄 Salva o aggiorna l'anamnesi nel documento utente
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        firstName,
        lastName,
        createdAt: serverTimestamp(),
        anamnesi,
      });
    } else {
      const userData = userSnap.data();
      if (!userData.anamnesi) {
        await updateDoc(userRef, {
          anamnesi,
        });
      }
    }

    // 🤖 Genera dieta con OpenAI
    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const dieta = completion.choices[0].message.content;

    // 💾 Salva la dieta generata nello stesso documento
    await updateDoc(userRef, {
      dieta,
    });

    return NextResponse.json({ ok: true, data: dieta });
  } catch (err: any) {
    console.error("Errore generazione dieta:", err);
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 });
  }
}