"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AnamnesiPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [anamnesi, setAnamnesi] = useState({
    eta: "",
    sesso: "",
    obiettivo: "massa",
    dieta: "onnivora",
    allergie: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnamnesi({ ...anamnesi, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user) return alert("Devi effettuare il login.");
    const docRef = doc(db, "anamnesi", user.uid);
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, { ...anamnesi, createdAt: serverTimestamp() });
    }
    const res = await fetch("/api/gpt/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anamnesi }),
    });
    const data = await res.json();
    if (data.ok) {
      await setDoc(doc(db, "diete", user.uid), {
        dieta: data.data,
        createdAt: serverTimestamp(),
      });
      router.push("/diet");
    } else {
      alert("Errore generazione dieta: " + data.error);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 p-6">
      <h1 className="text-2xl font-bold">Compila la tua anamnesi</h1>
      <input name="eta" placeholder="Età" type="number" onChange={handleChange} className="border p-2 w-full" />
      <select name="sesso" onChange={handleChange} className="border p-2 w-full">
        <option value="">Seleziona sesso</option>
        <option value="maschio">Maschio</option>
        <option value="femmina">Femmina</option>
      </select>
      <select name="obiettivo" onChange={handleChange} className="border p-2 w-full">
        <option value="massa">Aumento massa</option>
        <option value="dimagrimento">Dimagrimento</option>
      </select>
      <select name="dieta" onChange={handleChange} className="border p-2 w-full">
        <option value="onnivora">Onnivora</option>
        <option value="vegetariana">Vegetariana</option>
        <option value="vegana">Vegana</option>
      </select>
      <input name="allergie" placeholder="Allergie (opzionale)" onChange={handleChange} className="border p-2 w-full" />
      <button onClick={handleSubmit} className="bg-black text-white p-2 rounded">
        Genera dieta
      </button>
    </div>
  );
}