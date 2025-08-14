import { NextRequest, NextResponse } from "next/server"
import { getApps, initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { getAuth as getClientAuth } from "firebase/auth"
import OpenAI from "openai"
import { auth as clientAuth, db } from "@/lib/firebase"

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
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Token mancante" }, { status: 401 })
    }

    const idToken = authHeader.split("Bearer ")[1]
    const decodedToken = await clientAuth.currentUser?.getIdTokenResult()
    const uid = decodedToken?.claims?.user_id || decodedToken?.uid
    if (!uid) {
      return NextResponse.json({ ok: false, error: "Utente non valido" }, { status: 403 })
    }

    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    const userData = snap.data()

    const anamnesi = userData?.anamnesi
    if (!anamnesi || !anamnesi.dieta || !anamnesi.obiettivo || !anamnesi.sesso || !anamnesi.eta) {
      return NextResponse.json({ ok: false, error: "Anamnesi incompleta o non trovata" }, { status: 400 })
    }

    // Prompt ottimizzato per evitare testo extra
    const prompt = `
Crea una dieta settimanale divisa in 7 giorni, ognuno con:
- Colazione
- Spuntino
- Pranzo
- Spuntino
- Cena

Usa solo questo formato markdown:

## Giorno 1

### Colazione
- [cibo 1]
- [cibo 2]

### Spuntino
- [cibo 1]

... e così via per tutti i 7 giorni.

⚠️ NON scrivere alcuna introduzione, spiegazione, titolo o commento.

Profilo utente:
${JSON.stringify(anamnesi)}
`.trim()

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    })

    const dieta = completion.choices[0].message.content

    if (!dieta || dieta.length < 50) {
      return NextResponse.json({ ok: false, error: "Dieta generata troppo breve o vuota." }, { status: 500 })
    }

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