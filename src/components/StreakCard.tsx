"use client";
import { GlassCard } from "@/components/GlassCard";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StreakCard({ days=2 }: { days?: number }) {
  return (
    <GlassCard>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Giorni di fila</div>
          <div className="text-2xl font-semibold">{days}</div>
        </div>
        <Badge className="bg-[#FF6B00] text-white ios-rounded text-xs">Continua così 🔥</Badge>
      </CardContent>
    </GlassCard>
  );
}