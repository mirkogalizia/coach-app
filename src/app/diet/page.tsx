"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"

export default function DietaPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<string[]>([])
  const [currentDay, setCurrentDay] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchDieta = async () => {
      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)
      const data = snap.data()

      if (data?.dieta) {
        // Se esiste già la dieta salvata, splittala in giorni
        const giorni = data.dieta.split(/### (?=Luned\u00EC|Marted\u00EC|Mercoled\u00EC|Gioved\u00EC|Venerd\u00EC|Sabato|Domenica)/)
        setDays(giorni.map((g) => g.trim()))
        setLoading(false)
      } else {
        // Altrimenti genera con API
        const res = await fetch("/api/gpt/diet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid }),
        })

        const json = await res.json()
        if (json.ok) {
          const generated = json.data as string
          await updateDoc(ref, {
            dieta: generated,
            updatedAt: serverTimestamp(),
          })
          const giorni = generated.split(/### (?=Luned\u00EC|Marted\u00EC|Mercoled\u00EC|Gioved\u00EC|Venerd\u00EC|Sabato|Domenica)/)
          setDays(giorni.map((g) => g.trim()))
        } else {
          alert("Errore generazione dieta: " + json.error)
        }
        setLoading(false)
      }
    }

    fetchDieta()
  }, [user])

  if (loading) return <p className="text-center mt-20">Caricamento dieta...</p>
  if (!user) return <p className="text-center mt-20">Effettua il login</p>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">La tua dieta</h1>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentDay((prev) => Math.max(prev - 1, 0))}
          disabled={currentDay === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-30"
        >
          ⬅ Giorno precedente
        </button>
        <button
          onClick={() => setCurrentDay((prev) => Math.min(prev + 1, days.length - 1))}
          disabled={currentDay === days.length - 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-30"
        >
          Giorno successivo ➡
        </button>
      </div>

      <div className="border rounded-xl p-4 bg-white shadow space-y-2">
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{days[currentDay]}</pre>
      </div>
    </div>
  )
}