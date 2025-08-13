"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, type User } from "@/lib/firebase";
import { signInAnonymously, signOut } from "firebase/auth";

type Ctx = { user: User|null; loading: boolean; signInAnon: ()=>Promise<void>; logout: ()=>Promise<void> };
const FirebaseCtx = createContext<Ctx>({ user: null, loading: true, signInAnon: async()=>{}, logout: async()=>{} });

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const unsub = onAuthStateChanged(auth, (u)=>{ setUser(u); setLoading(false); });
    return ()=>unsub();
  }, []);

  async function signInAnon() { await signInAnonymously(auth); }
  async function logout() { await signOut(auth); }

  return (
    <FirebaseCtx.Provider value={{ user, loading, signInAnon, logout }}>
      {children}
    </FirebaseCtx.Provider>
  );
}

export function useFirebase(){ return useContext(FirebaseCtx); }