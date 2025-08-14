"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) return null;

  return (
    <LayoutWrapper>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Workout</h1>
        <p className="text-sm text-muted-foreground">
          Nessun piano di allenamento impostato. Chiedi al coach.
        </p>
      </div>
    </LayoutWrapper>
  );
}