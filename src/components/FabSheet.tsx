"use client";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function FabSheet(){
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("dock:fad", handler);
    return () => window.removeEventListener("dock:fad", handler);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="max-w-md mx-auto">
        <SheetHeader>
          <SheetTitle>Crea nuovo</SheetTitle>
        </SheetHeader>
        <div className="py-4 grid gap-2">
          <Button className="w-full">Aggiungi Pasto</Button>
          <Button variant="outline" className="w-full">Log Allenamento</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}