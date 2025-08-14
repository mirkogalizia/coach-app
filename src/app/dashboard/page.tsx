'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { WeeklyDots } from "@/components/WeeklyDots";
import { SimpleMacros } from "@/components/SimpleMacros";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground px-4">Caricamento…</div>;
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
    <div className="max-w-md mx-auto px-4 pt-6 pb-32 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Ciao 👋</h1>
        <Badge variant="secondary">Streak: {streakDays} giorni</Badge>
      </div>

      {/* MACRONUTRIENTI */}
      <Card className="glass-strong ios-rounded">
        <CardHeader>
          <CardTitle className="text-base">Macronutrienti</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleMacros
            kcal={macros.kcal}
            target={macros.target}
            p={macros.p}
            c={macros.c}
            f={macros.f}
          />
        </CardContent>
      </Card>

      {/* PIANO DI OGGI */}
      <Card className="glass-strong ios-rounded">
        <CardHeader>
          <CardTitle className="text-base">Piano di oggi</CardTitle>
          <Badge variant="outline" className="text-xs">Pranzo + Cena</Badge>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Pranzo</span>
            <span className="text-muted-foreground">Manzo + verdure + EVO</span>
          </div>
          <div className="flex justify-between">
            <span>Cena</span>
            <span className="text-muted-foreground">Salmone + insalata + uova</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="btn-gradient ios-rounded w-full h-9 text-sm">
            Chiedi una modifica al coach
          </Button>
        </CardFooter>
      </Card>

      {/* PROGRESSI */}
      <Card className="glass-strong ios-rounded">
        <CardHeader>
          <CardTitle className="text-base">Progressi settimanali</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyDots />
        </CardContent>
      </Card>
    </div>
  );
}