"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pwd);
      router.push("/"); // vai in home
    } catch (e: any) {
      setErr(e?.message ?? "Errore di accesso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <h1 className="text-xl font-semibold">Accedi</h1>
        <p className="text-sm text-muted-foreground">Entra nel tuo account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={pwd} onChange={(e)=>setPwd(e.target.value)} required />
          {err && <div className="text-xs text-red-600">{err}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : "Accedi"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm">
        <span className="text-muted-foreground mr-2">Non hai un account?</span>
        <Link href="/sign-up" className="underline">Registrati</Link>
      </CardFooter>
    </Card>
  );
}