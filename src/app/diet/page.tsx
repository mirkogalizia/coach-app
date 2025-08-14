"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/useAuth"
import { collection, query, orderBy, getDocs } from "firebase/firestore"

export default function DietPage() {
  const { user } = useAuth()
  const [dieta, setDieta] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) return

    const load = async () => {
      const q = query(collection(db, "users", user.uid, "diets"), orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const data = snap.docs[0].data()
        setDieta(data.dieta)
      }
    }

    load()
  }, [user])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">La tua dieta</h1>
      {dieta ? (
        <pre className="bg-gray-100 p-4 whitespace-pre-wrap rounded">{dieta}</pre>
      ) : (
        <p>Nessuna dieta trovata.</p>
      )}
    </div>
  )
}