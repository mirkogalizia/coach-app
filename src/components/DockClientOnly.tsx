// components/DockClientOnly.tsx
"use client";

import { useEffect } from "react";
import MobileDock from "@/components/MobileDock";

export default function DockClientOnly() {
  useEffect(() => {
    // qui puoi mettere eventuali listener client
    // window.addEventListener("dock:fad", () => {});
    return () => {
      // cleanup se aggiungi listener
    };
  }, []);

  return <MobileDock />;
}