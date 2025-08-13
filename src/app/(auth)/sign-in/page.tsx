"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Login failed:", err.code);
      setError("Email o password errati.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
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
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <p className="text-xs text-muted-foreground">
          Nuovo qui? <a className="underline" href="/sign-up">Registrati</a>
        </p>
      </div>
    </div>
  );
}