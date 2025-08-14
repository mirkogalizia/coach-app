// src/app/dashboard/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { WeeklyDots } from "@/components/WeeklyDots";
import { SimpleMacros } from "@/components/SimpleMacros";
import { GlassCard } from "@/components/GlassCard";
import {
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) return null;

  const macros = {
    kcal: 1240,
    target: 2100,
    p: 92,
    c: 28,
    f: 76,
  };

  return (
    <div className="space-y-4 pb-32">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Ciao 👋</div>
        <Badge variant="secondary">Streak: 3 giorni</Badge>
      </div>

      <GlassCard>
        <CardHeader className="pb-1">
          <CardTitle className="text-base">Macronutrienti</CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <SimpleMacros {...macros} />
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader className="py-2 flex justify-between items-center">
          <CardTitle className="text-base">Piano di oggi</CardTitle>
          <Badge variant="outline" className="text-xs">Pranzo + Cena</Badge>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Pranzo</span>
            <span className="text-muted-foreground">Manzo + verdure + EVO</span>
          </div>
          <div className="flex justify-between">
            <span>Cena</span>
            <span className="text-muted-foreground">Salmone + insalata + uova</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="w-full btn-gradient ios-rounded text-sm h-9">
            Chiedi una modifica al coach
          </Button>
        </CardFooter>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Progressi settimanali</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyDots />
        </CardContent>
      </GlassCard>
    </div>
  );
}