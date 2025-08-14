"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Salva/aggiorna il documento utente
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date(),
        }, { merge: true });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user };
}