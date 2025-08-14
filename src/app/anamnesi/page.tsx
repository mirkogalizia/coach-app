"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"

export default function AnamnesiPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const [anamnesi, setAnamnesi] = useState({
    eta: "",
    sesso: "",
    obiettivo: "massa",
    dieta: "onnivora",
    allergie: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnamnesi({ ...anamnesi, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!user) return alert("Devi essere loggato.")

    setLoading(true)
    const ref = doc(db, "users", user.uid)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      alert("Anamnesi già salvata.")
      setSaved(true)
    } else {
      await setDoc(ref, {
        ...anamnesi,
        email: user.email,
        uid: user.uid,
        createdAt: serverTimestamp(),
      })
      setSaved(true)
      alert("Anamnesi salvata con successo.")
    }

    setLoading(false)
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

      <button onClick={handleSubmit} disabled={loading || saved} className="bg-black text-white px-4 py-2 rounded">
        {loading ? "Salvataggio..." : saved ? "Anamnesi già salvata" : "Salva anamnesi"}
      </button>
    </div>
  )
}