"use client";

import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  data: any;
  setData: (data: any) => void;
};

export default function Step5FotoNote({ data, setData }: Props) {
  const [note, setNote] = useState(data.note || "");
  const [foto, setFoto] = useState(
    data.foto || {
      fronte: "",
      profilo: "",
      retro: "",
    }
  );

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // salva temporaneamente come URL locale
    const url = URL.createObjectURL(file);
    setFoto((prev: any) => ({ ...prev, [tipo]: url }));

    // In futuro qui puoi aggiungere upload su Firebase Storage e salvare la URL
    // const storageRef = ref(storage, `foto/${user.uid}/${tipo}`);
    // await uploadBytes(storageRef, file);
    // const downloadURL = await getDownloadURL(storageRef);
    // setFoto((prev) => ({ ...prev, [tipo]: downloadURL }));
  };

  useEffect(() => {
    setData({ ...data, foto, note });
  }, [foto, note]);

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
    </div>
  );
}