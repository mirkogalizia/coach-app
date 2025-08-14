import { NextRequest, NextResponse } from "next/server"
import { getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import OpenAI from "openai"

// Inizializza Firebase client-side compatibile
if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const db = getFirestore()
const auth = getAuth()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]

    // ✅ Verifica UID da token chiamando Firebase Auth REST API
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    )
    const verifyJson = await verifyRes.json()
    const uid = verifyJson.users?.[0]?.localId

    if (!uid) {
      return NextResponse.json({ ok: false, error: "Utente non valido" }, { status: 401 })
    }

    // 📄 Prendi dati utente da Firestore
    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    const data = snap.data()

    if (!data?.anamnesi) {
      return NextResponse.json({ ok: false, error: "Anamnesi non trovata" }, { status: 400 })
    }

    const prompt = `Crea una dieta settimanale divisa per 7 giorni, con i pasti suddivisi in colazione, spuntino, pranzo, spuntino, cena. Scrivi solo i pasti, senza commenti o introduzioni, in formato markdown. Dati utente: ${JSON.stringify(data.anamnesi)}`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    })

    const dieta = completion.choices[0].message.content || ""

    await updateDoc(ref, {
      dieta,
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({ ok: true, data: dieta })
  } catch (err: any) {
    console.error("Errore generazione dieta:", err)
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 })
  }
}import { NextRequest, NextResponse } from "next/server"
import { getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import OpenAI from "openai"

// Inizializza Firebase client-side compatibile
if (!getApps().length) {
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const db = getFirestore()
const auth = getAuth()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]

    // ✅ Verifica UID da token chiamando Firebase Auth REST API
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    )
    const verifyJson = await verifyRes.json()
    const uid = verifyJson.users?.[0]?.localId

    if (!uid) {
      return NextResponse.json({ ok: false, error: "Utente non valido" }, { status: 401 })
    }

    // 📄 Prendi dati utente da Firestore
    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    const data = snap.data()

    if (!data?.anamnesi) {
      return NextResponse.json({ ok: false, error: "Anamnesi non trovata" }, { status: 400 })
    }

    const prompt = `Crea una dieta settimanale divisa per 7 giorni, con i pasti suddivisi in colazione, spuntino, pranzo, spuntino, cena. Scrivi solo i pasti, senza commenti o introduzioni, in formato markdown. Dati utente: ${JSON.stringify(data.anamnesi)}`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    })

    const dieta = completion.choices[0].message.content || ""

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