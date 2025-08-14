"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AnamnesiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      alert("Utente non loggato");
      return;
    }

    const anamnesi = {
      obiettivo: "Perdere peso",
      stileVita: "Sedentario",
      preferenze: "Vegetariano",
      allergie: ["Lattosio"],
      note: "Nessuna nota",
    };

    try {
      await setDoc(doc(db, "anamnesi", user.uid), {
        ...anamnesi,
        createdAt: serverTimestamp(),
      });

      const res = await fetch("/api/ai/generate-diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anamnesi }),
      });

      const result = await res.json();
      console.log("🔥 Risposta API:", result);

      if (result.ok) {
        await setDoc(doc(db, "diete", user.uid), {
          dieta: result.data,
          createdAt: serverTimestamp(),
        });
        router.push("/diet");
      } else {
        console.error("Errore API:", result.error);
        alert("Errore nella generazione della dieta");
      }
    } catch (error) {
      console.error("❌ Errore submit:", error);
      alert("Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Test Generazione Dieta</h1>
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generazione in corso..." : "Genera dieta"}
      </Button>
    </main>
  );
}
