"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";

type Props = {
  data?: any;
  setData: (data: any) => void;
};

export default function Step2Obiettivi({ data = {}, setData }: Props) {
  const [info, setInfo] = useState({
    obiettivo: data?.obiettivo ?? "",
    tipoAllenamento: data?.tipoAllenamento ?? "",
    frequenzaAllenamento: data?.frequenzaAllenamento ?? "",
    prePostWo: data?.prePostWo ?? false,
  });

  useEffect(() => {
    setData({ ...data, ...info });
  }, [info]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Qual è il tuo obiettivo principale?</Label>
        <ToggleGroup
          type="single"
          className="flex gap-2 flex-wrap"
          value={info.obiettivo}
          onValueChange={(val) => setInfo({ ...info, obiettivo: val })}
        >
          <ToggleGroupItem value="massa">Massa</ToggleGroupItem>
          <ToggleGroupItem value="definizione">Definizione</ToggleGroupItem>
          <ToggleGroupItem value="ricomposizione">Ricomposizione</ToggleGroupItem>
          <ToggleGroupItem value="mantenimento">Mantenimento</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Che tipo di attività fisica fai?</Label>
        <Input
          placeholder="Es. Palestra, Calisthenics, Crossfit, Running..."
          value={info.tipoAllenamento}
          onChange={(e) => setInfo({ ...info, tipoAllenamento: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Quante volte a settimana ti alleni?</Label>
        <Input
          type="number"
          placeholder="Es. 3"
          value={info.frequenzaAllenamento}
          onChange={(e) =>
            setInfo({ ...info, frequenzaAllenamento: Number(e.target.value) })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Vuoi pasti specifici pre e post workout?</Label>
        <Switch
          checked={info.prePostWo}
          onCheckedChange={(val) => setInfo({ ...info, prePostWo: val })}
        />
      </div>
    </div>
  );
}