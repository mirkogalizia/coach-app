"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Componenti step
import Step1Generalita from "@/components/anamnesi/Step1Generalita";
import Step2Obiettivi from "@/components/anamnesi/Step2Obiettivi";
import Step3Preferenze from "@/components/anamnesi/Step3Preferenze";
import Step4Routine from "@/components/anamnesi/Step4Routine";
import Step5FotoNote from "@/components/anamnesi/Step5FotoNote";

const steps = [
  { title: "Generalità", component: Step1Generalita },
  { title: "Obiettivi & attività", component: Step2Obiettivi },
  { title: "Preferenze alimentari", component: Step3Preferenze },
  { title: "Routine", component: Step4Routine },
  { title: "Foto & note", component: Step5FotoNote },
];

export default function AnamnesiPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const StepComponent = steps[currentStep].component;

  const next = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const back = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const submit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, { anamnesi: data });
      router.push("/dashboard");
    } catch (err) {
      console.error("Errore salvataggio anamnesi:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg glass-strong ios-rounded">
        <CardHeader>
          <CardTitle className="text-lg">Step {currentStep + 1} – {steps[currentStep].title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <StepComponent data={data} setData={setData} />
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <Button variant="ghost" onClick={back} disabled={currentStep === 0}>Indietro</Button>

          {currentStep === steps.length - 1 ? (
            <Button onClick={submit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
              Salva e inizia
            </Button>
          ) : (
            <Button onClick={next}>Avanti</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}