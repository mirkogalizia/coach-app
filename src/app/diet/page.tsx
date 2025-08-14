"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"

export default function DietPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<string[][]>([])
  const [currentDay, setCurrentDay] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchDieta = async () => {
      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)
      const data = snap.data()

      const alreadyGenerated = data?.dieta && data.dieta.includes("Colazione")
      let dietaRaw = data?.dieta || ""

      if (!alreadyGenerated) {
        const token = await user.getIdToken()
        const res = await fetch("/api/gpt/diet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const json = await res.json()
        if (!json.ok) {
          alert("Errore generazione dieta: " + json.error)
          setLoading(false)
          return
        }

        dietaRaw = json.data
        await updateDoc(ref, {
          dieta: dietaRaw,
          updatedAt: serverTimestamp(),
        })
      }

      // Elimina blocchi markdown e split dei giorni
      const cleaned = dietaRaw.replace(/```markdown|```/g, "").trim()

      const parsedDays = cleaned
        .split(/# Giorno \d+/)
        .map((g) => g.trim())
        .filter((g) => g.length > 20)
        .map((text) => {
          return text
            .split(/\*\*([A-Za-zÀ-ù ]+):\*\*/)
            .reduce<string[][]>((acc, curr, i, arr) => {
              if (i % 2 === 1 && arr[i + 1]) {
                acc.push([curr.trim(), arr[i + 1].trim()])
              }
              return acc
            }, [])
        })

      setDays(parsedDays)
      setLoading(false)
    }

    fetchDieta()
  }, [user])

  if (!user) return <p className="text-center mt-20">Effettua il login</p>
  if (loading) return <p className="text-center mt-20">Caricamento dieta...</p>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">La tua dieta settimanale</h1>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentDay((prev) => Math.max(prev - 1, 0))}
          disabled={currentDay === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-30"
        >
          ⬅ Giorno precedente
        </button>
        <p className="font-semibold">Giorno {currentDay + 1}</p>
        <button
          onClick={() => setCurrentDay((prev) => Math.min(prev + 1, days.length - 1))}
          disabled={currentDay === days.length - 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-30"
        >
          Giorno successivo ➡
        </button>
      </div>

      <div className="rounded-xl p-4 bg-white/20 backdrop-blur shadow space-y-4">
        {days[currentDay].map(([title, content], i) => (
          <div key={i} className="bg-white/30 backdrop-blur-md rounded-lg p-4 shadow-md">
            <h4 className="font-semibold text-base mb-1 text-black/90 dark:text-white/90">
              {title}
            </h4>
            <p className="text-sm text-black/80 dark:text-white/80 leading-relaxed">
              {content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}