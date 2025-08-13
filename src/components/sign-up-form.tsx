"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pwd);
    } catch (err: any) {
      setError("Errore nella registrazione");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button className="w-full" onClick={handleSignUp}>
        Registrati
      </Button>
    </div>
  );
}