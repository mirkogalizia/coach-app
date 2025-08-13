// src/app/diet/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

export default function DietPage() {
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
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Piano alimentare</h1>
      <p className="text-sm text-muted-foreground">
        Nessun piano impostato per oggi. Puoi chiedere al coach qui sotto.
      </p>

      <Button className="w-full" variant="secondary">
        Chiedi al coach
      </Button>
    </div>
  );
}