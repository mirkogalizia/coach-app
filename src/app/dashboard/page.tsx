"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { WeeklyDots } from "@/components/WeeklyDots";
import { SimpleMacros } from "@/components/SimpleMacros";

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

  const streakDays = 3;

  return (
    <div className="pt-6 pb-[120px] px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Ciao 👋</div>
        <Badge variant="secondary">
          Streak: {streakDays} giorni
        </Badge>
      </div>

      {/* Macros giornalieri */}
      <Card className="bg-white/70 backdrop-blur-md border border-border shadow-xl">
        <CardHeader className="pb-1">
          <CardTitle className="text-base">I tuoi macronutrienti</CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <SimpleMacros
            kcal={macros.kcal}
            target={macros.target}
            p={macros.p}
            c={macros.c}
            f={macros.f}
          />
        </CardContent>
      </Card>

      {/* Piano giornaliero */}
      <Card className="bg-white/70 backdrop-blur-md border border-border shadow-xl">
        <CardHeader className="py-2 flex items-center justify-between">
          <CardTitle className="text-base">Piano di oggi</CardTitle>
          <Badge variant="outline" className="text-xs">Pranzo + Cena</Badge>
        </CardHeader>
        <CardContent className="py-2 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Pranzo</span>
            <span className="text-muted-foreground">Manzo + verdure + EVO</span>
          </div>
          <div className="flex justify-between">
            <span>Cena</span>
            <span className="text-muted-foreground">Salmone + insalata + uova</span>
          </div>
        </CardContent>
        <CardFooter className="pt-1">
          <Button className="btn-gradient ios-rounded w-full h-9 text-sm">
            Chiedi una modifica al coach
          </Button>
        </CardFooter>
      </Card>

      {/* Progressi settimanali */}
      <Card className="bg-white/70 backdrop-blur-md border border-border shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progressi settimanali</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <WeeklyDots />
        </CardContent>
      </Card>
    </div>
  );
}