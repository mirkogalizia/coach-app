"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { LoaderCircle } from "lucide-react"

export default function DietaPage() {
  const [dieta, setDieta] = useState<string | null>(null)

  useEffect(() => {
    const fetchDieta = async () => {
      const user = auth.currentUser
      if (!user) return
      const snap = await getDoc(doc(db, "diete", user.uid))
      if (snap.exists()) {
        const data = snap.data()
        setDieta(data.dieta)
      } else {
        setDieta("Nessuna dieta trovata.")
      }
    }
    fetchDieta()
  }, [])

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">La tua dieta personalizzata</h1>
      {!dieta && (
        <div className="flex items-center space-x-2 text-gray-500">
          <LoaderCircle className="animate-spin" />
          <span>Caricamento...</span>
        </div>
      )}
      {dieta && (
        <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
          {dieta}
        </div>
      )}
    </main>
  )
}