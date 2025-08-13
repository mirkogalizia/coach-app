// app/home-client.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomeClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // se già loggato → vai in dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <div className="min-h-[100dvh] grid place-items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-2xl font-semibold">Coach</div>
          <div className="text-sm text-muted-foreground">
            La tua dieta e workout, ottimizzati giorno per giorno.
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li>Dashboard mobile-first</li>
            <li>Dieta personalizzata</li>
            <li>Modifiche “chiedi al coach”</li>
          </ul>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link href="/sign-in" className="flex-1">
            <Button className="w-full" variant="secondary">Accedi</Button>
          </Link>
          <Link href="/sign-up" className="flex-1">
            <Button className="w-full">Registrati</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}