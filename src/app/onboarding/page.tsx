"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) { router.replace("/sign-in"); return null; }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Benvenuto!</h1>
      <p className="text-sm text-muted-foreground">
        Qui chiederemo sesso, età, altezza, peso, obiettivi e preferenze per costruire la tua dieta.
      </p>
      <Button onClick={() => router.push("/")}>Fine (torna alla Home)</Button>
    </div>
  );
}