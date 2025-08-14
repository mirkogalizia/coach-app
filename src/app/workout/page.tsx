"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) return null;

  return (
    <LayoutWrapper>
      <Card className="bg-white/70 backdrop-blur-md shadow-xl border-none rounded-xl">
        <CardHeader className="flex items-center gap-2">
          <Dumbbell className="text-primary" />
          <CardTitle className="text-lg font-semibold">Allenamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nessun piano impostato per oggi. Puoi chiedere al coach qui sotto.
          </p>
        </CardContent>
      </Card>
    </LayoutWrapper>
  );
}