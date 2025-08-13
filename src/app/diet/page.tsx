"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MealCard } from "@/components/meal-card";
import { ChatDock } from "@/components/chat-dock";

export default function DietPage(){
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  async function handleAI(message:string){
    // TODO: chiamata reale a /api/ai/adjust
    const mock = {
      meals:[
        { name:"Pranzo", items:[
          { label:"Tortellini", grams:180, kcal:450, p:16, c:75, f:8 },
          { label:"Petto di pollo", grams:160, kcal:260, p:38, c:0, f:6 },
        ]},
        { name:"Cena", items:[
          { label:"Salmone", grams:200, kcal:430, p:40, c:0, f:28 },
          { label:"Insalata + EVO", grams:150, kcal:120, p:2, c:3, f:10 },
        ]}
      ],
      totals:{ kcal: 2080, p: 185, c: 95, f: 85 }
    };
    setPreview(mock); setOpen(true);
  }

  return (
    <div className="space-y-3 pb-28">
      <MealCard title="Pranzo" kcal={985} items={[
        {label:"Manzo magro", grams:300, macro:"P60 C0 F30"},
        {label:"Parmigiano", grams:30, macro:"P11 C0 F9"},
        {label:"Zucchine + EVO", grams:150, macro:"P3 C5 F12"},
      ]} />
      <MealCard title="Cena" kcal={900} items={[
        {label:"Salmone", grams:180, macro:"P35 C0 F20"},
        {label:"Uova + mayo", grams:2, macro:"P12 C0 F15"},
        {label:"Insalata + EVO", grams:150, macro:"P2 C3 F10"},
      ]} />
      <Button className="w-full" variant="secondary" onClick={()=>handleAI("Ottimizza giornata")}>
        Ottimizza con AI
      </Button>

      <ChatDock context="diet" onSend={handleAI} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Proposta AI – Dieta di oggi</DialogTitle></DialogHeader>
          <div className="space-y-2 text-sm max-h-[50vh] overflow-auto">
            {preview?.meals?.map((m:any, i:number)=> (
              <div key={i}>
                <div className="font-medium">{m.name}</div>
                {m.items.map((it:any, k:number)=> (
                  <div key={k} className="flex justify-between">
                    <span>{it.label} • {it.grams}g</span>
                    <span>{Math.round(it.kcal)} kcal • P{it.p} C{it.c} F{it.f}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="text-xs text-muted-foreground">Totali: ~{preview?.totals?.kcal} kcal • P{preview?.totals?.p} C{preview?.totals?.c} F{preview?.totals?.f}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Annulla</Button>
            <Button>Applica</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}