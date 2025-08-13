// app/dashboard/page.tsx
"use client"

import { Dumbbell } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in")
  }, [loading, user, router])

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>
  if (!user) return null

  return (
    <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto space-y-6">
      {/* Intestazione utente */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-2 rounded-lg shadow">
            <Dumbbell className="size-5" />
          </div>
          <div className="text-lg font-semibold">Benvenuto 👋</div>
        </div>
        <Badge className="bg-secondary text-black">Streak: 3 giorni</Badge>
      </div>

      {/* Card macro */}
      <Card className="backdrop-blur-md bg-white/60 shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-base">Macronutrienti di oggi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Calorie</div>
            <div className="font-bold text-lg">1240 / 2100 kcal</div>
          </div>
          <div>
            <div className="text-muted-foreground">Proteine</div>
            <div className="font-bold">92g</div>
          </div>
          <div>
            <div className="text-muted-foreground">Carboidrati</div>
            <div className="font-bold">28g</div>
          </div>
          <div>
            <div className="text-muted-foreground">Grassi</div>
            <div className="font-bold">76g</div>
          </div>
        </CardContent>
      </Card>

      {/* Card piano di oggi */}
      <Card className="backdrop-blur-md bg-white/60 shadow-xl border-none">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-base">Piano alimentare</CardTitle>
          <Badge variant="outline" className="text-xs">Pranzo + Cena</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Pranzo</span>
            <span className="text-muted-foreground">Manzo + verdure + EVO</span>
          </div>
          <div className="flex justify-between">
            <span>Cena</span>
            <span className="text-muted-foreground">Salmone + insalata + uova</span>
          </div>
          <Button className="w-full mt-3 text-sm">Chiedi una modifica al coach</Button>
        </CardContent>
      </Card>

      {/* Card allenamento */}
      <Card className="backdrop-blur-md bg-white/60 shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-base">Allenamento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Oggi: Petto + Tricipiti – 45 minuti
        </CardContent>
      </Card>
    </div>
  )
}