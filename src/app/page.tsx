// app/page.tsx
"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleMacros } from "@/components/SimpleMacros";
import { WeeklyDots } from "@/components/WeeklyDots";

export default function HomePage() {
  // dati mock rapidi
  const [macros] = useState({ kcal: 1240, target: 2100, p: 92, c: 28, f: 76 });
  const streakDays = 3;

  return (
    // altezza fissa: occupa l’intero viewport meno la dock (~110px)
    <div className="mx-auto max-w-md px-3 pt-3 h-[calc(100dvh-110px)] overflow-hidden">
      {/* Layout a griglia: 4 righe, spazi ottimizzati, niente scroll */}
      <div className="grid h-full grid-rows-[auto_auto_auto_1fr] gap-2">

        {/* 1) Header compatto */}
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">Ciao 👋</div>
          <Badge variant="secondary" className="bg-[#FFD580] text-[#1A1A1A]">
            Streak: {streakDays} giorni
          </Badge>
        </div>

        {/* 2) Macro semplici (card vetro compatta) */}
        <div className="shrink-0">
          <SimpleMacros
            kcal={macros.kcal}
            target={macros.target}
            p={macros.p}
            c={macros.c}
            f={macros.f}
          />
        </div>

        {/* 3) Piano di oggi + CTA piccola */}
        <GlassCard className="shrink-0">
          <CardHeader className="py-2 flex items-center justify-between">
            <CardTitle className="text-base">Piano di oggi</CardTitle>
            <Badge variant="outline" className="text-xs">Pranzo + Cena</Badge>
          </CardHeader>
          <CardContent className="py-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Pranzo</span><span className="text-muted-foreground">Manzo + verdure + EVO</span>
            </div>
            <div className="flex justify-between">
              <span>Cena</span><span className="text-muted-foreground">Salmone + insalata + uova</span>
            </div>
          </CardContent>
          <CardFooter className="pt-1">
            <Button className="btn-gradient ios-rounded w-full h-9 text-sm">
              Chiedi una modifica al coach
            </Button>
          </CardFooter>
        </GlassCard>

        {/* 4) Weekly dots (occupazione elastica in basso) */}
        <div className="min-h-0 overflow-hidden">
          <WeeklyDots />
        </div>
      </div>
    </div>
  );
}