// ✅ AnamnesiPage.tsx
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Step1Obiettivi from "@/components/anamnesi/Step1Obiettivi";
import Step2Stile from "@/components/anamnesi/Step2Stile";
import Step3Preferenze from "@/components/anamnesi/Step3Preferenze";
import Step4Allergie from "@/components/anamnesi/Step4Allergie";
import Step5FotoNote from "@/components/anamnesi/Step5FotoNote";
import { Button } from "@/components/ui/button";

export default function AnamnesiPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const checkExisting = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, "anamnesi", user.uid));
      if (snap.exists()) router.push("/diet");
    };
    checkExisting();
  }, [router]);

  const handleNext = (data: any) => {
    setFormData({ ...formData, ...data });
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (data: any) => {
    const user = auth.currentUser;
    if (!user) return;

    const anamnesi = { ...formData, ...data };

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

    if (result.ok) {
      const dieta = result.data;
      await setDoc(doc(db, "diete", user.uid), {
        dieta,
        createdAt: serverTimestamp(),
      });
      router.push("/diet");
    } else {
      console.error("Errore nella generazione della dieta:", result.error);
    }
  };

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Anamnesi alimentare</h1>

      {step === 1 && <Step1Obiettivi onNext={handleNext} defaultData={formData} />}
      {step === 2 && <Step2Stile onNext={handleNext} defaultData={formData} />}
      {step === 3 && <Step3Preferenze onNext={handleNext} defaultData={formData} />}
      {step === 4 && <Step4Allergie onNext={handleNext} defaultData={formData} />}
      {step === 5 && (
        <Step5FotoNote
          data={formData}
          setData={setFormData}
          onSubmit={handleSubmit}
        />
      )}

      {step > 1 && (
        <Button variant="ghost" className="mt-4" onClick={() => setStep((prev) => prev - 1)}>
          Indietro
        </Button>
      )}
    </main>
  );
}
