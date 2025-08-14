"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignIn() {
    console.log("🔑 Tentativo di login...");
    setError("");
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      console.log("✅ Login OK:", cred.user.email);

      // 🔍 Recupero dati utente da Firestore
      const userRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      // 🔁 Redirect condizionato
      if (userData?.anamnesi) {
        router.push("/dashboard");
      } else {
        router.push("/anamnesi");
      }
    } catch (err: any) {
      console.error("❌ Login failed:", err.code);
      setError("Email o password errati.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm glass-strong ios-rounded">
        <CardHeader>
          <CardTitle className="text-lg">Accedi al tuo account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <Input
              type="password"
              placeholder="Password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full ios-rounded"
          >
            {loading ? "Accesso in corso…" : "Entra"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Nuovo qui? <a href="/sign-up" className="underline">Registrati</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}