import { NextRequest, NextResponse } from "next/server"
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { uid, email, firstName, lastName, anamnesi } = await req.json()

    if (!uid) {
      return NextResponse.json({ ok: false, error: "UID mancante" }, { status: 401 })
    }

    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid,
        email,
        firstName,
        lastName,
        createdAt: serverTimestamp(),
        anamnesi,
      })
    } else {
      const userData = userSnap.data()
      if (!userData.anamnesi) {
        await updateDoc(userRef, { anamnesi })
      }
    }

    // Genera la dieta con OpenAI
    const prompt = `Crea una dieta settimanale per un utente con queste caratteristiche: ${JSON.stringify(anamnesi)}`
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    })

    const dieta = completion.choices[0].message.content

    await updateDoc(userRef, { dieta })

    return NextResponse.json({ ok: true, data: dieta })
  } catch (err: any) {
    console.error("Errore generazione dieta:", err)
    return NextResponse.json({ ok: false, error: err.message || "Errore interno" }, { status: 500 })
  }
}