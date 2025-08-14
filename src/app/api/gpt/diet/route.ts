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
    const uid = await getUidFromToken(idToken);
    if (!uid) {
      return NextResponse.json({ ok: false, error: "Token non valido" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    let { anamnesi } = body || {};

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!anamnesi) {
      const data = snap.data();
      if (!data || !(data.eta && data.sesso && data.obiettivo && data.dieta)) {
        return NextResponse.json({ ok: false, error: "Anamnesi incompleta o non trovata" }, { status: 400 });
      }
      anamnesi = {
        eta: data.eta,
        sesso: data.sesso,
        obiettivo: data.obiettivo,
        dieta: data.dieta,
        allergie: data.allergie || "",
      };
    }

    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}`;

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

async function getUidFromToken(token: string): Promise<string | null> {
  try {
    // 👉 Client-side token verification fallback
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    const json = await res.json();
    return json?.users?.[0]?.localId || null;
  } catch (e) {
    console.error("Errore verifica token:", e);
    return null;
  }
}