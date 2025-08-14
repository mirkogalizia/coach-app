"use client"

import { useState } from "react"
import { useAuth } from "@/lib/useAuth"

export default function AnamnesiPage() {
  const { user } = useAuth()
  const [anamnesi, setAnamnesi] = useState({
    eta: "",
    sesso: "",
    obiettivo: "massa",
    dieta: "onnivora",
    allergie: "",
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAnamnesi({ ...anamnesi, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!user) return alert("Non sei loggato.")

    setLoading(true)

    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/gpt/diet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ anamnesi }),
      })

      const data = await res.json()

      if (data.ok) {
        setResult(data.data) // puoi anche fare un redirect a /diet
      } else {
        alert("Errore: " + data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Errore nella generazione.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Anamnesi</h1>

      <input type="number" name="eta" placeholder="Età" onChange={handleChange} className="border p-2 w-full" />
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
      <input type="text" name="allergie" placeholder="Allergie (opzionale)" onChange={handleChange} className="border p-2 w-full" />

      <button onClick={handleSubmit} disabled={loading} className="bg-black text-white px-4 py-2 rounded">
        {loading ? "Generazione in corso..." : "Genera dieta"}
      </button>

      {result && (
        <pre className="mt-4 p-4 bg-gray-100 whitespace-pre-wrap">{result}</pre>
      )}
    </div>
  )
}
