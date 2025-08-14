"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type Props = {
  data?: any;
  setData: (data: any) => void;
};

const carbOptions = ["Pasta", "Pane", "Riso", "Patate", "Farro", "Avena", "Legumi"];
const proteinOptions = ["Carne rossa", "Pollo", "Pesce", "Uova", "Tofu", "Yogurt greco", "Proteine in polvere"];
const fatOptions = ["Olio EVO", "Frutta secca", "Avocado", "Burro", "Semi"];

export default function Step3Preferenze({ data = {}, setData }: Props) {
  const [info, setInfo] = useState({
    preferenze: data.preferenze || {
      carboidrati: [],
      proteine: [],
      grassi: [],
    },
    alimentazione: data.alimentazione || "",
  });

  useEffect(() => {
    setData({ ...data, ...info });
  }, [info]);

  const toggleItem = (group: "carboidrati" | "proteine" | "grassi", item: string) => {
    const current = info.preferenze[group];
    const updated = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];

    setInfo({
      ...info,
      preferenze: {
        ...info.preferenze,
        [group]: updated,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo di alimentazione</Label>
        <ToggleGroup
          type="single"
          className="flex gap-2 flex-wrap"
          value={info.alimentazione}
          onValueChange={(val) => setInfo({ ...info, alimentazione: val })}
        >
          <ToggleGroupItem value="onnivoro">Onnivoro</ToggleGroupItem>
          <ToggleGroupItem value="vegetariano">Vegetariano</ToggleGroupItem>
          <ToggleGroupItem value="vegano">Vegano</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Preferenze – Carboidrati</Label>
        <div className="flex flex-wrap gap-2">
          {carbOptions.map((item) => (
            <button
              key={item}
              onClick={() => toggleItem("carboidrati", item)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border",
                info.preferenze.carboidrati.includes(item)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferenze – Proteine</Label>
        <div className="flex flex-wrap gap-2">
          {proteinOptions.map((item) => (
            <button
              key={item}
              onClick={() => toggleItem("proteine", item)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border",
                info.preferenze.proteine.includes(item)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Preferenze – Grassi</Label>
        <div className="flex flex-wrap gap-2">
          {fatOptions.map((item) => (
            <button
              key={item}
              onClick={() => toggleItem("grassi", item)}
              className={cn(
                "px-3 py-1 text-sm rounded-full border",
                info.preferenze.grassi.includes(item)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}