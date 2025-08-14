// ✅ /src/app/api/gpt/diet/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getApps, initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import OpenAI from "openai"
import { db } from "@/lib/firebase"

if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 })

    const idToken = authHeader.split("Bearer ")[1]
    const uid = req.nextUrl.searchParams.get("uid") || ""
    if (!uid) return NextResponse.json({ ok: false, error: "UID mancante" }, { status: 400 })

    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    const userData = snap.data()
    if (!snap.exists() || !userData?.anamnesi) {
      return NextResponse.json({ ok: false, error: "Anamnesi incompleta o non trovata" }, { status: 400 })
    }

    const prompt = `Genera una dieta settimanale personalizzata per un utente con queste caratteristiche: ${JSON.stringify(userData.anamnesi)}.

Rispondi solo in JSON, nel seguente formato:
{
  "Lunedì": {
    "Colazione": "...",
    "Spuntino": "...",
    "Pranzo": "...",
    "SpuntinoPomeridiano": "...",
    "Cena": "..."
  },
  "Martedì": { ... },
  ...
  "Domenica": { ... }
}

Solo JSON. Nessun testo introduttivo, markdown o note finali.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    })

    const dietaRaw = completion.choices[0].message.content || ""
    const dieta = JSON.parse(dietaRaw)

    await updateDoc(ref, {
      dieta,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ ok: true, data: dieta })
  } catch (err: any) {
    console.error("Errore generazione dieta:", err)
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 })
  }
}