"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (user) {
    // Qui mostri la tua home “vera” (coach, macros, ecc.)
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Bentornato, {user.email}</h1>
        <Card>
          <CardHeader className="pb-2 font-medium">Piano di oggi</CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Apri la sezione Dieta per vedere i pasti.
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/diet")} className="w-full">Vai a Dieta</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Landing login/registrazione
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <h1 className="text-xl font-bold">Coach</h1>
        <p className="text-sm text-muted-foreground">
          La tua dieta e il tuo workout, su misura.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button asChild className="w-full">
          <Link href="/sign-in">Accedi</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/sign-up">Registrati</Link>
        </Button>
      </CardContent>
    </Card>
  );
}