"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
    } catch (err: any) {
      setError("Credenziali errate");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button className="w-full" onClick={handleLogin}>
        Accedi
      </Button>
    </div>
  );
}