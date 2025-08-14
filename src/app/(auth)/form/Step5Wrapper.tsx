"use client";

import { useState } from "react";
import Step5FotoNote from "./Step5FotoNote";

export default function Step5Wrapper() {
  const [data, setData] = useState({});

  const handleSubmit = (datiFinali: any) => {
    console.log("✅ Dati inviati:", { ...data, ...datiFinali });
    // Qui puoi fare:
    // - salvataggio su Firebase
    // - invio API
    // - redirect...
    alert("Inviato! Controlla console per i dati.");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Step5FotoNote
        data={data}
        setData={setData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}