// app/page.tsx (aggiunta solo la WeeklyDots in coda)
"use client";
import { CoachMessageCard } from "@/components/CoachMessageCard";
import { StreakCard } from "@/components/StreakCard";
import { SimpleMacros } from "@/components/SimpleMacros";
import { GlassCard } from "@/components/GlassCard";
import { CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeeklyDots } from "@/components/WeeklyDots"; // <--- NEW

export default function HomePage(){
  return (
    <div className="space-y-3">
      <CoachMessageCard />
      <StreakCard days={2} />
      <SimpleMacros kcal={1240} target={2100} p={92} c={28} f={76} />

      <GlassCard>
        <CardHeader className="pb-2 flex items-center justify-between">
          <div className="font-semibold">Piano di oggi</div>
          <Badge variant="secondary" className="bg-[#FFD580] text-[#1A1A1A]">Pranzo + Cena</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Pranzo</span><span>Manzo + verdure + olio EVO</span>
          </div>
          <div className="flex justify-between">
            <span>Cena</span><span>Salmone + insalata + uova</span>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button className="btn-gradient ios-rounded w-full">Chiedi una modifica al coach</Button>
        </CardFooter>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard><CardContent className="p-3 text-sm">💧 Bevi 2 bicchieri d’acqua</CardContent></GlassCard>
        <GlassCard><CardContent className="p-3 text-sm">🚶‍♂️ 10′ camminata leggera</CardContent></GlassCard>
      </div>

      {/* ⬇️ NUOVA CARD SETTIMANALE */}
      <WeeklyDots />
    </div>
  );
}