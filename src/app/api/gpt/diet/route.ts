// 1. API ROUTE - /app/api/gpt/diet/route.ts

import { NextResponse } from "next/server"
import { getApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { initializeFirebaseAdmin } from "@/lib/firebase-admin"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const db = getFirestore(getApp())
  const { anamnesi } = await req.json()

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "Sei un nutrizionista. Genera una dieta personalizzata di 7 giorni con colazione, spuntino, pranzo, spuntino e cena ogni giorno. Considera le preferenze: stile di vita sedentario, vegetariano, intolleranza al lattosio, e altre fornite nell'anamnesi. Scrivi tutto in italiano."
      },
      {
        role: "user",
        content: `Dati utente:\n${JSON.stringify(anamnesi)}`
      }
    ]
  })

  const dietText = completion.choices[0].message.content || ""

  const dietRef = doc(db, "diet", session.user.email)
  await setDoc(dietRef, { text: dietText, createdAt: Date.now() })

  return NextResponse.json({ ok: true })
}
