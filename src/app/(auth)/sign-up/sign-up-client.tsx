"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignUpClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp() {
    console.log("🟡 handleSignUp avviato");
    setError("");
    setLoading(true);

    console.log("📧 Email:", email);
    console.log("🔑 Password:", pwd);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, pwd);
      console.log("✅ Registrazione riuscita:", result.user);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Errore nella registrazione Firebase:", err);
      setError("Errore nella registrazione. Email già in uso o password troppo debole.");
    } finally {
      setLoading(false);
      console.log("⚪ handleSignUp terminato");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Registrati</h1>
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
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? "Registrazione…" : "Registrati"}
        </button>
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Hai già un account? <a className="underline" href="/(auth)/sign-in">Accedi</a>
      </p>
    </div>
  );
}