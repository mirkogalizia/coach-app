import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getApps, initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// 🔐 Inizializza Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const db = getFirestore()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Token mancante")

    const token = authHeader.replace("Bearer ", "")
    const decoded = await getAuth().verifyIdToken(token)
    const uid = decoded.uid

    const { anamnesi } = await req.json()
    const prompt = `Crea una dieta personalizzata per aumento massa muscolare con questi dati: ${JSON.stringify(anamnesi)}. Formatta in JSON se possibile.`

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    })

    const dieta = completion.choices[0].message.content

    // Salva la dieta nel Firestore
    await db.collection("users").doc(uid).collection("diets").add({
      dieta,
      createdAt: new Date(),
      anamnesi,
    })

    return NextResponse.json({ ok: true, data: dieta })
  } catch (err: any) {
    console.error("❌ Errore:", err)
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 })
  }
}