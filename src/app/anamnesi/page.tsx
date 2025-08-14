"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function AnamnesiPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    età: "",
    altezza: "",
    peso: "",
    obiettivo: "",
    attivita: "",
    frequenzaAllenamento: "",
    allergie: "",
    proteine: "",
    carboidrati: "",
    grassi: "",
    sveglia: "",
    sonno: "",
    orariPasti: "",
    pastiAlGiorno: "",
    prePostWO: "",
    note: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user?.anamnesi) {
      router.replace("/dashboard");
    }
  }, [loading, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          anamnesi: {
            nome: form.nome,
            età: Number(form.età),
            altezza: Number(form.altezza),
            peso: Number(form.peso),
            obiettivo: form.obiettivo,
            attivita: {
              tipo: form.attivita,
              frequenza: Number(form.frequenzaAllenamento),
            },
            allergie: form.allergie.split(",").map((a) => a.trim()),
            preferenze: {
              proteine: form.proteine.split(",").map((p) => p.trim()),
              carboidrati: form.carboidrati.split(",").map((c) => c.trim()),
              grassi: form.grassi.split(",").map((g) => g.trim()),
            },
            routine: {
              sveglia: form.sveglia,
              sonno: form.sonno,
              orari_pasti: form.orariPasti.split(",").map((o) => o.trim()),
            },
            pasti_al_giorno: Number(form.pastiAlGiorno),
            pre_post_wo: form.prePostWO === "sì",
            note: form.note,
          },
        },
        { merge: true }
      );

      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Errore salvataggio anamnesi:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md glass-strong ios-rounded overflow-y-auto max-h-screen">
        <CardHeader>
          <CardTitle className="text-lg">Anamnesi iniziale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            ["nome", "Nome"],
            ["età", "Età"],
            ["altezza", "Altezza (cm)"],
            ["peso", "Peso (kg)"],
            ["obiettivo", "Obiettivo (massa, dimagrire…)"],
            ["attivita", "Tipo di attività (palestra, corsa…)"],
            ["frequenzaAllenamento", "Allenamenti a settimana"],
            ["allergie", "Allergie (separate da virgole)"],
            ["proteine", "Proteine preferite (uova, pollo…)"],
            ["carboidrati", "Carboidrati preferiti (riso, patate…)"],
            ["grassi", "Grassi preferiti (olio, frutta secca…)"],
            ["sveglia", "Orario sveglia"],
            ["sonno", "Orario sonno"],
            ["orariPasti", "Orari pasti (separati da virgole)"],
            ["pastiAlGiorno", "Numero pasti al giorno"],
            ["prePostWO", "Snack pre/post workout? (sì/no)"],
          ].map(([name, label]) => (
            <Input
              key={name}
              name={name}
              placeholder={label}
              value={(form as any)[name]}
              onChange={handleChange}
              className="text-sm"
            />
          ))}

          <Textarea
            name="note"
            placeholder="Note aggiuntive"
            value={form.note}
            onChange={handleChange}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? "Salvataggio…" : "Continua"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}