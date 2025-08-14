"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Salad } from "lucide-react";
import { ChatDock } from "@/components/chat-dock";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PreviewMealItem = {
  label: string;
  grams: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
};

type PreviewMeal = {
  name: string;
  items: PreviewMealItem[];
};

type PreviewPayload = {
  meals: PreviewMeal[];
  totals: { kcal: number; p: number; c: number; f: number };
};

export default function DietPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, user, router]);

  if (loading) return <div className="text-sm text-muted-foreground">Caricamento…</div>;
  if (!user) return null;

  function handleAI(_msg: string) {
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
    <div className="space-y-6 pb-28">
      <Card className="bg-white/70 backdrop-blur-md shadow-xl border-none rounded-xl">
        <CardHeader className="flex items-center gap-2">
          <Salad className="text-primary" />
          <CardTitle className="text-lg font-semibold">Piano alimentare</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nessun piano impostato per oggi. Puoi chiedere al coach qui sotto.
          </p>
        </CardContent>
      </Card>

      <Button
        className="w-full h-10 text-sm font-medium ios-rounded btn-gradient"
        onClick={() => handleAI("Ottimizza giornata")}
      >
        Chiedi al coach
      </Button>

      <ChatDock context="diet" onSend={handleAI} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Proposta – Dieta di oggi</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm max-h-[50vh] overflow-auto">
            {preview?.meals.map((m, i) => (
              <div key={i}>
                <div className="font-medium">{m.name}</div>
                {m.items.map((it, k) => (
                  <div key={k} className="flex justify-between">
                    <span>{it.label} • {it.grams}g</span>
                    <span>{Math.round(it.kcal)} kcal • P{it.p} C{it.c} F{it.f}</span>
                  </div>
                ))}
              </div>
            ))}
            {preview && (
              <div className="text-xs text-muted-foreground pt-2">
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