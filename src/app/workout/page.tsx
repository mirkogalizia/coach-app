"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { ChatDock } from "@/components/chat-dock";

export default function WorkoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) return null;

  return (
    <div className="space-y-6 pb-28">
      <div className="flex items-center gap-2">
        <Dumbbell className="text-primary" />
        <h1 className="text-xl font-bold">Allenamento</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Nessun piano impostato per oggi. Puoi chiedere al coach qui sotto.
      </p>
      <Button className="w-full">Chiedi al coach</Button>
      <ChatDock context="workout" onSend={() => {}} />
    </div>
  );
}