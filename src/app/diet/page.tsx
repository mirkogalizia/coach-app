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

export default function DietPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [parsedDays, setParsedDays] = useState<any[]>([])
  const [currentDay, setCurrentDay] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchDieta = async () => {
      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)
      const data = snap.data()

      const alreadyGenerated = data?.dieta && data.dieta.includes("Giorno")

      if (alreadyGenerated) {
        const days = data.dieta.split(/## Giorno \d+/).filter(Boolean)
        const headers = data.dieta.match(/## Giorno \d+/g) || []

        const parsed = days.map((day, index) => {
          const meals = {} as any
          const blocks = day.split(/### /).slice(1)
          blocks.forEach(block => {
            const [meal, ...items] = block.trim().split("\n")
            meals[meal.trim()] = items.filter(line => line.startsWith("- ")).map(line => line.replace(/^-\s*/, ""))
          })
          return {
            title: headers[index],
            meals
          }
        })

        setParsedDays(parsed)
        setLoading(false)
        return
      }

      // Altrimenti richiedi rigenerazione
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
        const generated = json.data as string
        await updateDoc(ref, {
          dieta: generated,
          updatedAt: serverTimestamp(),
        })
        location.reload() // ricarica la pagina per parsare la dieta
      } else {
        alert("Errore generazione dieta: " + json.error)
      }

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
        <p className="font-semibold">{parsedDays[currentDay].title}</p>
        <button
          onClick={() => setCurrentDay((prev) => Math.min(prev + 1, parsedDays.length - 1))}
          disabled={currentDay === parsedDays.length - 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-30"
        >
          Giorno successivo ➡
        </button>
      </div>

      <div className="border rounded-xl p-4 bg-white shadow space-y-6">
        {Object.entries(parsedDays[currentDay].meals).map(([meal, items]) => (
          <div key={meal}>
            <h3 className="font-semibold text-lg mb-1">{meal}</h3>
            <ul className="list-disc ml-6 text-sm text-gray-800">
              {(items as string[]).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}