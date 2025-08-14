// src/app/anamnesi/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/useAuth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function Anamnesi() {
  const { user } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState({
    goal: "massa",
    age: "",
    weight: "",
    training: "3",
    allergies: "",
    dislikes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!user?.uid) return
    setLoading(true)

    try {
      // 1. Chiamata a GPT per generare preferenze dieta
      const gptRes = await fetch("/api/gpt/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const { preferences } = await gptRes.json()

      // 2. Chiamata a /api/ai/diet-generate con le preferenze di GPT
      const generateRes = await fetch("/api/ai/diet-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
      const diet = await generateRes.json()

      // 3. Salva tutto su Firebase
      await setDoc(doc(db, "diet", user.uid), {
        user: user.uid,
        form,
        preferences,
        diet,
        updatedAt: Date.now(),
      })

      router.push("/diet")
    } catch (err) {
      alert("Errore nella generazione della dieta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Compila la tua anamnesi</h1>
      <input type="number" name="age" placeholder="Età" value={form.age} onChange={handleChange} />
      <input type="number" name="weight" placeholder="Peso (kg)" value={form.weight} onChange={handleChange} />
      <select name="goal" value={form.goal} onChange={handleChange}>
        <option value="massa">Aumentare massa</option>
        <option value="definizione">Definizione</option>
      </select>
      <select name="training" value={form.training} onChange={handleChange}>
        <option value="2">2 allenamenti/settimana</option>
        <option value="3">3 allenamenti/settimana</option>
        <option value="4">4 o più</option>
      </select>
      <input type="text" name="allergies" placeholder="Allergie?" value={form.allergies} onChange={handleChange} />
      <input type="text" name="dislikes" placeholder="Cibi non graditi?" value={form.dislikes} onChange={handleChange} />
      <button className="bg-black text-white px-4 py-2" onClick={handleSubmit} disabled={loading}>
        {loading ? "Generazione in corso..." : "Genera dieta"}
      </button>
    </div>
  )
}
