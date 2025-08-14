"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  data?: any;
  setData: (data: any) => void;
  onNext: () => void; // ✅ AGGIUNTO
};

const orariPossibili = [
  "7", "8", "9", "10", "11", "12", "13", "14",
  "15", "16", "17", "18", "19", "20", "21", "22"
];

export default function Step4Routine({ data = {}, setData, onNext }: Props) {
  const [routine, setRoutine] = useState(() => {
    const r = data.routine || {};
    return {
      sveglia: r.sveglia || "",
      sonno: r.sonno || "",
      orari_pasti: r.orari_pasti || [],
    };
  });

  useEffect(() => {
    setData({ ...data, routine });
  }, [routine]);

  const togglePasto = (ora: string) => {
    const exists = routine.orari_pasti.includes(ora);
    const updated = exists
      ? routine.orari_pasti.filter((v: string) => v !== ora)
      : [...routine.orari_pasti, ora];

    setRoutine({ ...routine, orari_pasti: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label>Orario sveglia</Label>
        <Input
          type="time"
          value={routine.sveglia}
          onChange={(e) => setRoutine({ ...routine, sveglia: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Orario sonno</Label>
        <Input
          type="time"
          value={routine.sonno}
          onChange={(e) => setRoutine({ ...routine, sonno: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Orari tipici dei pasti</Label>
        <div className="flex flex-wrap gap-2">
          {orariPossibili.map((ora) => (
            <button
              key={ora}
              onClick={() => togglePasto(ora)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border",
                routine.orari_pasti.includes(ora)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {ora}:00
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <Button onClick={onNext}>Avanti</Button> {/* ✅ BOTTONE */}
      </div>
    </div>
  );
}