"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  data: any;
  setData: (data: any) => void;
};

export default function Step1Generalita({ data, setData }: Props) {
  const [info, setInfo] = useState({
    nome: data.nome || "",
    età: data.età || "",
    altezza: data.altezza || "",
    peso: data.peso || "",
    sesso: data.sesso || "",
    allergie: data.allergie || "",
  });

  useEffect(() => {
    setData({ ...data, ...info });
  }, [info]);

  return (
    <div className="space-y-6">
      <div>
        <Label>Nome</Label>
        <Input
          type="text"
          placeholder="Es. Mario"
          value={info.nome}
          onChange={(e) => setInfo({ ...info, nome: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Età</Label>
          <Input
            type="number"
            placeholder="Es. 34"
            value={info.età}
            onChange={(e) => setInfo({ ...info, età: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Sesso</Label>
          <Input
            type="text"
            placeholder="Es. Maschio / Femmina"
            value={info.sesso}
            onChange={(e) => setInfo({ ...info, sesso: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Altezza (cm)</Label>
          <Input
            type="number"
            placeholder="Es. 180"
            value={info.altezza}
            onChange={(e) => setInfo({ ...info, altezza: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Peso (kg)</Label>
          <Input
            type="number"
            placeholder="Es. 75"
            value={info.peso}
            onChange={(e) => setInfo({ ...info, peso: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <Label>Allergie note</Label>
        <Input
          type="text"
          placeholder="Es. Lattosio, Glutine..."
          value={info.allergie}
          onChange={(e) => setInfo({ ...info, allergie: e.target.value })}
        />
      </div>
    </div>
  );
}