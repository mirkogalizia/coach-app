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
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

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

      const alreadyGenerated = data?.dieta && data.dieta.includes("Colazione")

      if (alreadyGenerated) {
        const giorni = data.dieta.split(/### (?=Luned|Marted|Mercoled|Gioved|Venerd|Sabato|Domenica)/)
        setDays(giorni.map((g) => g.trim()))
        setLoading(false)
        return
      }

      // Non esiste dieta generata: la chiediamo via API
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

        const giorni = generated.split(/### (?=Luned|Marted|Mercoled|Gioved|Venerd|Sabato|Domenica)/)
        setDays(giorni.map((g) => g.trim()))
      } else {
        alert("Errore generazione dieta: " + json.error)
      }

      setLoading(false)
    }

    fetchDieta()
  }, [user])

  if (!user) return <p className="text-center mt-20">Effettua il login</p>
  if (loading) return <p className="text-center mt-20">Caricamento dieta...</p>
  if (!days.length) return <p className="text-center mt-20">Dieta non trovata.</p>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">La tua dieta settimanale</h1>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentDay((prev) => Math.max(prev - 1, 0))}
          disabled={currentDay === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Giorno precedente
        </Button>
        <p className="text-base font-semibold">Giorno {currentDay + 1}</p>
        <Button
          variant="outline"
          onClick={() => setCurrentDay((prev) => Math.min(prev + 1, days.length - 1))}
          disabled={currentDay === days.length - 1}
        >
          Giorno successivo <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="prose max-w-none py-6">
          <article dangerouslySetInnerHTML={{ __html: days[currentDay].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
        </CardContent>
      </Card>
    </div>
  )
}