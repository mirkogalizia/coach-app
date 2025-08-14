"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
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

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const checkAnamnesi = async () => {
      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)
      const data = snap.data()
      if (data?.anamnesi) {
        router.push("/diet")
      } else {
        setLoading(false) // mostra il form solo se manca l'anamnesi
      }
    }
    checkAnamnesi()
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnamnesi({ ...anamnesi, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!user) return alert("Devi essere loggato per salvare l'anamnesi.")
    setLoading(true)

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        anamnesi,
        createdAt: serverTimestamp(),
      }, { merge: true })

      router.push("/dieta")
    } catch (error) {
      console.error("Errore salvataggio:", error)
      alert("Errore durante il salvataggio.")
      setLoading(false)
    }
  }

  if (!user) return <p className="text-center mt-20">Effettua il login</p>
  if (loading) return <p className="text-center mt-20">Controllo dati...</p>

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
        {loading ? "Salvataggio..." : "Salva anamnesi"}
      </button>
    </div>
  )
}