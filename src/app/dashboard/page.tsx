"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AppLayout from "@/components/AppLayout";
import { WeeklyDots } from "@/components/WeeklyDots";
import { SimpleMacros } from "@/components/SimpleMacros";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

  const streakDays = 3;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-semibold">Ciao 👋</div>
        <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
          Streak: {streakDays} giorni
        </Badge>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Macronutrienti</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleMacros {...macros} />
          </CardContent>
        </Card>

        <Card>
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progressi settimanali</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyDots />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}