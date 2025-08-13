"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Credenziali errate o utente inesistente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Accedi</h1>
      <div className="space-y-2">
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border px-3 py-2 text-sm"
          placeholder="Password"
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <button
          className="w-full rounded-md bg-black text-white py-2 text-sm disabled:opacity-50"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? "Accesso in corso…" : "Entra"}
        </button>
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Nuovo qui? <a className="underline" href="/(auth)/sign-up">Registrati</a>
      </p>
    </div>
  );
}