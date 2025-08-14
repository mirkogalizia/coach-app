// src/app/diet/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"

export default function DietPage() {
  const { user } = useAuth()
  const [diets, setDiets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return

    const loadDiets = async () => {
      try {
        const dietsRef = collection(db, "users", user.uid, "diets")
        const q = query(dietsRef, orderBy("createdAt", "desc"))
        const snap = await getDocs(q)
        const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setDiets(items)
      } catch (err) {
        console.error("Errore nel caricamento delle diete:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDiets()
  }, [user])

  if (loading) return <p className="p-4">Caricamento dieta…</p>
  if (diets.length === 0) return <p className="p-4">Nessuna dieta trovata.</p>

  const last = diets[0]

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">La tua dieta personalizzata</h1>
      <p className="text-sm text-gray-500">Generata il {new Date(last.createdAt.seconds * 1000).toLocaleDateString()}</p>

      <div className="whitespace-pre-line border p-4 rounded-lg shadow bg-white">
        {last.dieta}
      </div>
    </div>
  )
}