// src/app/diet/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function DietPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!user?.uid) return
    const load = async () => {
      const snap = await getDoc(doc(db, "diet", user.uid))
      if (snap.exists()) setData(snap.data())
    }
    load()
  }, [user])

  if (!data) return <p>Caricamento dieta…</p>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">La tua dieta personalizzata</h1>
      {data.diet.week.map((day: any) => (
        <div key={day.date} className="border p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">{day.date}</h2>
          {day.meals.map((meal: any) => (
            <div key={meal.name} className="mt-2">
              <h3 className="font-semibold">{meal.name}</h3>
              <ul className="list-disc ml-5">
                {meal.items.map((it: any) => (
                  <li key={it.code}>
                    {it.name} – {it.grams}g (P:{it.per100.p} C:{it.per100.c} F:{it.per100.f})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}