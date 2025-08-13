"use client";

import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <div className="min-h-[100dvh] grid place-items-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Crea account</h1>
        <div className="space-y-2">
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Password"
            type="password"
            value={pwd}
            onChange={(e)=>setPwd(e.target.value)}
          />
          <button
            className="w-full rounded-md bg-black text-white py-2 text-sm"
            onClick={()=>{/* TODO: Firebase signUp */}}
          >
            Registrati
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Hai già un account? <a className="underline" href="/(auth)/sign-in">Accedi</a>
        </p>
      </div>
    </div>
  );
}