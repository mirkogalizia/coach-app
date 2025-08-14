// app/anamnesi/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Step1Generalita } from "@/components/steps/Step1Generalita";
import { Step2Obiettivo } from "@/components/steps/Step2Obiettivo";
import { Step3Preferenze } from "@/components/steps/Step3Preferenze";
import { Step4Routine } from "@/components/steps/Step4Routine";
import { Step5Foto } from "@/components/steps/Step5Foto";
import { saveAnamnesiData } from "@/lib/saveAnamnesi";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const steps = [
  Step1Generalita,
  Step2Obiettivo,
  Step3Preferenze,
  Step4Routine,
  Step5Foto,
];

export default function AnamnesiPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const StepComponent = steps[step];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const updateForm = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveAnamnesiData(user.uid, formData);
      router.push("/dashboard");
    } catch (err) {
      console.error("Errore salvataggio:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!user) return null;
  if (user.anamnesi) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md glass-strong ios-rounded">
        <CardHeader>
          <CardTitle className="text-lg">Anamnesi ({step + 1} / {steps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <StepComponent data={formData} onChange={updateForm} />
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          {step > 0 ? <Button onClick={back}>Indietro</Button> : <div />}
          {step < steps.length - 1 ? (
            <Button onClick={next}>Avanti</Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvataggio…" : "Conferma"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// components/steps/Step1Generalita.tsx
"use client";

import { Input } from "@/components/ui/input";
import { CardDescription } from "@/components/ui/card";

export function Step1Generalita({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <CardDescription className="text-sm text-muted-foreground">
        Inserisci le tue informazioni di base per iniziare il percorso personalizzato.
      </CardDescription>
      <Input
        name="nome"
        placeholder="Nome"
        value={data.nome || ""}
        onChange={(e) => onChange({ nome: e.target.value })}
      />
      <Input
        name="sesso"
        placeholder="Sesso (M/F)"
        value={data.sesso || ""}
        onChange={(e) => onChange({ sesso: e.target.value })}
      />
      <Input
        name="età"
        placeholder="Età"
        type="number"
        value={data.età || ""}
        onChange={(e) => onChange({ età: e.target.value })}
      />
      <Input
        name="altezza"
        placeholder="Altezza in cm"
        type="number"
        value={data.altezza || ""}
        onChange={(e) => onChange({ altezza: e.target.value })}
      />
      <Input
        name="peso"
        placeholder="Peso in kg"
        type="number"
        value={data.peso || ""}
        onChange={(e) => onChange({ peso: e.target.value })}
      />
    </div>
  );
}