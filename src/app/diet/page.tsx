"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DietPage() {
  const { user } = useAuth();
  const [text, setText] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "diete", user.uid));
      if (snap.exists()) setText(snap.data()?.dieta || "");
    };
    load();
  }, [user]);

  if (!text) return <p className="p-4">Caricamento dieta…</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 whitespace-pre-wrap">
      <h1 className="text-2xl font-bold mb-4">La tua dieta</h1>
      {text}
    </div>
  );
}