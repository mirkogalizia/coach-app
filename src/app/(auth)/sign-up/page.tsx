"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pwd);
      if (name) await updateProfile(cred.user, { displayName: name });
      router.push("/onboarding"); // subito verso onboarding profilo
    } catch (e: any) {
      setErr(e?.message ?? "Errore di registrazione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <h1 className="text-xl font-semibold">Registrati</h1>
        <p className="text-sm text-muted-foreground">Crea il tuo account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Nome (opzionale)" value={name} onChange={(e)=>setName(e.target.value)} />
          <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password (min 6 caratteri)" value={pwd} onChange={(e)=>setPwd(e.target.value)} required />
          {err && <div className="text-xs text-red-600">{err}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : "Crea account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm">
        <span className="text-muted-foreground mr-2">Hai già un account?</span>
        <Link href="/sign-in" className="underline">Accedi</Link>
      </CardFooter>
    </Card>
  );
}