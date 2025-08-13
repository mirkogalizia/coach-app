"use client";
import { ReactNode } from "react";
import { MobileDock } from "@/components/MobileDock";

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="max-w-md mx-auto px-3 pt-3 pb-[120px]">{children}</div>
      <MobileDock />
    </>
  );
}