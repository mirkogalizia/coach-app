"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  data?: any;
  setData: (data: any) => void;
  onSubmit: (data: any) => void;
};

export default function Step5FotoNote({ data = {}, setData, onSubmit }: Props) {
  const [note, setNote] = useState<string>(data.note || "");
  const [foto, setFoto] = useState<Record<string, string>>({
    fronte: data.foto?.fronte || "",
    profilo: data.foto?.profilo || "",
    retro: data.foto?.retro || "",
  });

  const uploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview locale (puoi rimuoverlo se carichi direttamente su Firebase)
    const url = URL.createObjectURL(file);
    setFoto((prev) => ({ ...prev, [tipo]: url }));

    // TODO: Upload su Firebase Storage se necessario
  };

  useEffect(() => {
    setData({ ...data, note, foto });
  }, [note, foto]);

  const handleInvia = () => {
    onSubmit({ ...data, note, foto });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Note aggiuntive</Label>
        <Textarea
          placeholder="Scrivi qui se hai esigenze particolari o vuoi aggiungere qualcosa."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-4">
        <Label className="block">Foto corpo (opzionale)</Label>

        {["fronte", "profilo", "retro"].map((tipo) => (
          <div key={tipo} className="space-y-1">
            <Label className="capitalize">{tipo}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e, tipo)}
            />
            {foto[tipo] && (
              <img
                src={foto[tipo]}
                alt={tipo}
                className="w-full h-auto rounded-lg border mt-2"
              />
            )}
          </div>
        ))}
      </div>

      <div className="pt-6">
        <Button onClick={handleInvia}>Invia</Button>
      </div>
    </div>
  );
}