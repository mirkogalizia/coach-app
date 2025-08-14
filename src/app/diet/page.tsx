"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"

export default function DietPage() {
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

      const raw = data?.dieta || ""
      const clean = raw
        .replace(/^.*?# Dieta settimanale.*?## Giorno 1/i, "## Giorno 1") // elimina tutto prima di Giorno 1
        .replace(/```(.*?)```/gs, "") // rimuove markdown code block
        .replace(/#+ Giorno /g, "\n## Giorno ") // normalizza titoli

      const giorni = clean
        .split(/## Giorno \d+/)
        .map((g) => g.trim())
        .filter((g) => g.length > 10)

      setDays(giorni)
      setLoading(false)

      if (!data?.dieta || giorni.length < 7) {
        // rigenera dieta se mancano giorni
        try {
          const token = await user.getIdToken()
          const res = await fetch("/api/gpt/diet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
          const json = await res.json()
          if (json.ok) {
            await updateDoc(ref, {
              dieta: json.data,
              updatedAt: serverTimestamp(),
            })
          }
        } catch (err) {
          console.error("Errore aggiornamento dieta:", err)
        }
      }
    }

    fetchDieta()
  }, [user])

  if (!user) return <p className="text-center mt-20">Effettua il login</p>
  if (loading) return <p className="text-center mt-20">Caricamento dieta...</p>

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">La tua dieta settimanale</h1>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentDay((prev) => Math.max(prev - 1, 0))}
          disabled={currentDay === 0}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30"
        >
          ⬅ Giorno precedente
        </button>

        <p className="font-semibold text-lg">
          Giorno {currentDay + 1}
        </p>

        <button
          onClick={() => setCurrentDay((prev) => Math.min(prev + 1, days.length - 1))}
          disabled={currentDay === days.length - 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-30"
        >
          Giorno successivo ➡
        </button>
      </div>

      <div className="backdrop-blur-md bg-white/40 dark:bg-black/30 shadow-xl rounded-xl p-6 border border-white/20 space-y-4">
        {days[currentDay]
          .split(/\n(?=- |\*\*)/g)
          .map((line, i) => (
            <p key={i} className="text-base leading-relaxed text-gray-800 dark:text-gray-100">
              {line.replace(/^[-*]\s?/, "")}
            </p>
          ))}
      </div>
    </div>
  )
}