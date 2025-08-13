"use client";
import { GlassCard } from "@/components/GlassCard";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function CoachMessageCard() {
  return (
    <GlassCard className="ios-rounded">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-full p-2 bg-orange-100/60">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="space-y-1">
            <div className="font-semibold">Ottimo inizio! 👏</div>
            <p className="text-sm text-muted-foreground leading-snug">
              Tieni questo ritmo per <span className="font-medium">14 giorni</span> e vedrai già la pancia più piatta.
              Pensa semplice: <span className="font-medium">pranzo + cena</span>, proteine in ogni pasto, verdure e grassi “buoni”.
            </p>
            <div className="pt-2">
              <Button className="btn-gradient ios-rounded w-full">Mostrami il piano dei 14 giorni</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}