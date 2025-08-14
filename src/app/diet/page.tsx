"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/useAuth"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DietPage() {
  const { user } = useAuth()
  const [dieta, setDieta] = useState<Record<string, any> | null>(null)
  const [days, setDays] = useState<string[]>([])
  const [currentDay, setCurrentDay] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadDieta = async () => {
      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)
      const data = snap.data()

      if (data?.dieta && typeof data.dieta === "object") {
        const keys = [
          "Lunedì",
          "Martedì",
          "Mercoledì",
          "Giovedì",
          "Venerdì",
          "Sabato",
          "Domenica",
        ].filter((k) => k in data.dieta)
        setDays(keys)
        setDieta(data.dieta)
      }
      setLoading(false)
    }

    loadDieta()
  }, [user])

  if (!user) return <p className="text-center mt-20">Effettua il login</p>
  if (loading) return <p className="text-center mt-20">Caricamento dieta...</p>
  if (!dieta) return <p className="text-center mt-20">Dieta non trovata</p>

  const giorno = days[currentDay]
  const pasti = dieta[giorno] || {}

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">La tua dieta</h1>

      <div className="flex justify-between items-center">
        <Button
          onClick={() => setCurrentDay((prev) => Math.max(prev - 1, 0))}
          disabled={currentDay === 0}
          variant="outline"
        >
          ⬅ Giorno precedente
        </Button>

        <p className="font-semibold text-lg">{giorno}</p>

        <Button
          onClick={() => setCurrentDay((prev) => Math.min(prev + 1, days.length - 1))}
          disabled={currentDay === days.length - 1}
          variant="outline"
        >
          Giorno successivo ➡
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(pasti).map(([pasto, descrizione]) => (
          <Card key={pasto} className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg capitalize">{pasto}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line leading-relaxed">{descrizione}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}