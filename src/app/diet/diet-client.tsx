"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

import { MealCard } from "@/components/meal-card"; // ✅ Named export
import ChatDock from "@/components/chat-dock"; // ✅ Default export

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

type PreviewMealItem = {
  label: string;
  grams: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
};
type PreviewMeal = { name: string; items: PreviewMealItem[] };
type PreviewPayload = {
  meals: PreviewMeal[];
  totals: { kcal: number; p: number; c: number; f: number };
};

export default function DietClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/sign-in");
    }
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) return null;

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);

  function handleAI(_message: string) {
    const mock: PreviewPayload = {
      meals: [
        {
          name: "Pranzo",
          items: [
            { label: "Pollo", grams: 200, kcal: 330, p: 60, c: 0, f: 7 },
            { label: "Insalata + EVO", grams: 150, kcal: 120, p: 2, c: 3, f: 10 },
          ],
        },
        {
          name: "Cena",
          items: [
            { label: "Salmone", grams: 200, kcal: 420, p: 40, c: 0, f: 28 },
          ],
        },
      ],
      totals: { kcal: 870, p: 102, c: 3, f: 45 },
    };
    setPreview(mock);
    setOpen(true);
  }

  return (
    <div className="space-y-4 pb-28">
      <MealCard
        title="Pranzo"
        kcal={985}
        items={[
          { label: "Manzo magro", grams: 300, macro: "P60 C0 F30" },
          { label: "Parmigiano", grams: 30, macro: "P11 C0 F9" },
          { label: "Zucchine + EVO", grams: 150, macro: "P3 C5 F12" },
        ]}
      />

      <MealCard
        title="Cena"
        kcal={900}
        items={[
          { label: "Salmone", grams: 180, macro: "P35 C0 F20" },
          { label: "Uova + mayo", grams: 2, macro: "P12 C0 F15" },
          { label: "Insalata + EVO", grams: 150, macro: "P2 C3 F10" },
        ]}
      />

      <Button className="w-full" variant="secondary" onClick={() => handleAI("Ottimizza giornata")}>
        Chiedi una modifica al coach
      </Button>

      <ChatDock context="diet" onSend={handleAI} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Proposta – Dieta di oggi</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 text-sm max-h-[50vh] overflow-auto">
            {preview?.meals.map((meal, i) => (
              <div key={i}>
                <div className="font-medium">{meal.name}</div>
                {meal.items.map((it, k) => (
                  <div key={k} className="flex justify-between">
                    <span>{it.label} • {it.grams}g</span>
                    <span>{Math.round(it.kcal)} kcal • P{it.p} C{it.c} F{it.f}</span>
                  </div>
                ))}
              </div>
            ))}
            {preview && (
              <div className="text-xs text-muted-foreground">
                Totali: ~{preview.totals.kcal} kcal • P{preview.totals.p} C{preview.totals.c} F{preview.totals.f}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
            <Button>Applica</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}