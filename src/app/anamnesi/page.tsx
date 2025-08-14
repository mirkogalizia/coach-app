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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription } from "@/components/ui/card";

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

// Step 1 – Generalità
export function Step1Generalita({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <CardDescription className="text-sm text-muted-foreground">
        Inserisci le tue informazioni personali di base.
      </CardDescription>
      <Input name="nome" placeholder="Nome" value={data.nome || ""} onChange={(e) => onChange({ nome: e.target.value })} />
      <Input name="sesso" placeholder="Sesso (M / F)" value={data.sesso || ""} onChange={(e) => onChange({ sesso: e.target.value })} />
      <Input name="età" placeholder="Età" type="number" value={data.età || ""} onChange={(e) => onChange({ età: e.target.value })} />
      <Input name="altezza" placeholder="Altezza (cm)" type="number" value={data.altezza || ""} onChange={(e) => onChange({ altezza: e.target.value })} />
      <Input name="peso" placeholder="Peso (kg)" type="number" value={data.peso || ""} onChange={(e) => onChange({ peso: e.target.value })} />
    </div>
  );
}

// Step 2 – Obiettivo e Attività
export function Step2Obiettivo({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <CardDescription className="text-sm text-muted-foreground">
        Indica il tuo obiettivo e il tipo di attività fisica che svolgi.
      </CardDescription>
      <Input name="obiettivo" placeholder="Obiettivo (massa, dimagrire, definizione...)" value={data.obiettivo || ""} onChange={(e) => onChange({ obiettivo: e.target.value })} />
      <Input name="attivita" placeholder="Tipo attività (palestra, corsa, sport, nessuna)" value={data.attivita || ""} onChange={(e) => onChange({ attivita: e.target.value })} />
      <Input name="frequenzaAllenamento" placeholder="Quante volte a settimana?" type="number" value={data.frequenzaAllenamento || ""} onChange={(e) => onChange({ frequenzaAllenamento: e.target.value })} />
    </div>
  );
}

// Step 3 – Preferenze alimentari
export function Step3Preferenze({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <CardDescription className="text-sm text-muted-foreground">
        Aiutaci a capire cosa ti piace mangiare. Inserisci le tue preferenze separate da virgola.
      </CardDescription>
      <Input name="allergie" placeholder="Allergie o intolleranze (es: glutine, lattosio)" value={data.allergie || ""} onChange={(e) => onChange({ allergie: e.target.value })} />
      <Input name="proteine" placeholder="Proteine preferite (pollo, uova, pesce...)" value={data.proteine || ""} onChange={(e) => onChange({ proteine: e.target.value })} />
      <Input name="carboidrati" placeholder="Carboidrati preferiti (riso, pasta, patate...)" value={data.carboidrati || ""} onChange={(e) => onChange({ carboidrati: e.target.value })} />
      <Input name="grassi" placeholder="Grassi preferiti (olio evo, frutta secca...)" value={data.grassi || ""} onChange={(e) => onChange({ grassi: e.target.value })} />
    </div>
  );
}

// Step 4 – Routine
export function Step4Routine({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <CardDescription className="text-sm text-muted-foreground">
        Informazioni sulla tua giornata tipo.
      </CardDescription>
      <Input name="sveglia" placeholder="A che ora ti svegli? (es: 7:00)" value={data.sveglia || ""} onChange={(e) => onChange({ sveglia: e.target.value })} />
      <Input name="sonno" placeholder="A che ora vai a dormire? (es: 23:00)" value={data.sonno || ""} onChange={(e) => onChange({ sonno: e.target.value })} />
      <Input name="orariPasti" placeholder="Orari pasti (es: 8:00, 13:00, 20:00)" value={data.orariPasti || ""} onChange={(e) => onChange({ orariPasti: e.target.value })} />
      <Input name="pastiAlGiorno" placeholder="Quanti pasti al giorno?" type="number" value={data.pastiAlGiorno || ""} onChange={(e) => onChange({ pastiAlGiorno: e.target.value })} />
      <Input name="prePostWO" placeholder="Snack pre/post workout? (sì / no)" value={data.prePostWO || ""} onChange={(e) => onChange({ prePostWO: e.target.value })} />
      <Textarea name="note" placeholder="Note aggiuntive (es: dieta Ramadan, esigenze religiose)" value={data.note || ""} onChange={(e) => onChange({ note: e.target.value })} />
    </div>
  );
}

// Step 5 – Foto
export function Step5Foto({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="space-y-3">
      <CardDescription className="text-sm text-muted-foreground">
        Carica 3 foto: frontale, laterale e posteriore per aiutare l'analisi visiva.
      </CardDescription>
      <Input type="file" accept="image/*" onChange={(e) => onChange({ fotoFront: e.target.files?.[0] })} />
      <Input type="file" accept="image/*" onChange={(e) => onChange({ fotoSide: e.target.files?.[0] })} />
      <Input type="file" accept="image/*" onChange={(e) => onChange({ fotoBack: e.target.files?.[0] })} />
    </div>
  );
}
