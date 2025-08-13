"use client";
import { GlassCard } from "@/components/GlassCard";
import { CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SimpleMacros({
  kcal = 1240,
  target = 2100,
  p = 92, c = 28, f = 76,
}:{ kcal?: number; target?: number; p?: number; c?: number; f?: number; }) {
  const pct = Math.min(100, Math.round((kcal/target)*100));
  return (
    <GlassCard>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Calorie di oggi</div>
          <div className="text-sm font-medium">{kcal} / {target}</div>
        </div>
        <Progress value={pct} className="h-2" />
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2 ios-rounded glass text-center">
            <div className="text-[11px] text-muted-foreground">Proteine</div>
            <div className="font-semibold">{p} g</div>
          </div>
          <div className="p-2 ios-rounded glass text-center">
            <div className="text-[11px] text-muted-foreground">Carbo</div>
            <div className="font-semibold">{c} g</div>
          </div>
          <div className="p-2 ios-rounded glass text-center">
            <div className="text-[11px] text-muted-foreground">Grassi</div>
            <div className="font-semibold">{f} g</div>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}