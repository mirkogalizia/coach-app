"use client"

import { useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function AnamnesiPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [anamnesi, setAnamnesi] = useState({
    eta: "",
    sesso: "",
    obiettivo: "massa",
    dieta: "onnivora",
    allergie: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnamnesi({ ...anamnesi, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!user) return alert("Devi essere loggato")

    setLoading(true)

    try {
      // 🔎 Controlla se l'anamnesi esiste
      const docRef = doc(db, "users", user.uid)
      const snap = await getDoc(docRef)

      if (!snap.exists() || !snap.data().anamnesi) {
        // 💾 Salva anamnesi
        await setDoc(docRef, { anamnesi }, { merge: true })
      }

      // 🤖 Chiama API per generare dieta
      const token = await user.getIdToken()
      const res = await fetch("/api/gpt/diet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ anamnesi }),
      })

      const data = await res.json()
      if (data.ok) {
        router.push("/diet")
      } else {
        alert("Errore generazione dieta: " + data.error)
      }
    } catch (err) {
      console.error("Errore:", err)
      alert("Errore nella generazione")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Anamnesi</h1>

      <input type="number" name="eta" placeholder="Età" onChange={handleChange} className="border p-2 w-full" />
      <select name="sesso" onChange={handleChange} className="border p-2 w-full">
        <option value="">Seleziona sesso</option>
        <option value="maschio">Maschio</option>
        <option value="femmina">Femmina</option>
      </select>
      <select name="obiettivo" onChange={handleChange} className="border p-2 w-full">
        <option value="massa">Aumento massa</option>
        <option value="dimagrimento">Dimagrimento</option>
      </select>
      <select name="dieta" onChange={handleChange} className="border p-2 w-full">
        <option value="onnivora">Onnivora</option>
        <option value="vegetariana">Vegetariana</option>
        <option value="vegana">Vegana</option>
      </select>
      <input type="text" name="allergie" placeholder="Allergie (opzionale)" onChange={handleChange} className="border p-2 w-full" />

      <button onClick={handleSubmit} disabled={loading} className="bg-black text-white px-4 py-2 rounded">
        {loading ? "Generazione in corso..." : "Genera dieta"}
      </button>
    </div>
  )
}
