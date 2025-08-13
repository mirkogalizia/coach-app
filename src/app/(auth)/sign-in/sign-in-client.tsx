// src/app/(auth)/sign-in/sign-in-client.tsx
"use client";

import { useState } from "react";

export default function SignInClient() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Accedi</h1>
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
          onClick={()=>{/* TODO: sign-in Firebase */}}
        >
          Entra
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Nuovo qui? <a className="underline" href="/(auth)/sign-up">Registrati</a>
      </p>
    </div>
  );
}