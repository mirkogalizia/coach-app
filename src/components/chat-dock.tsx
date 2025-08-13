"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatDock({ context = "diet", onSend }: { context?: "diet" | "workout"; onSend: (msg: string) => void; }) {
  const [msg, setMsg] = useState("");
  const placeholder = context === "diet"
    ? "Chiedi al tuo coach (es: voglia di tortellini, riequilibra oggi)"
    : "Chiedi al tuo coach (es: sostituisci spinte con panca piana)";
  return (
    <div className="fixed bottom-[72px] inset-x-0 z-40">
      <div className="mx-auto max-w-md px-3">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="py-2">
            <div className="flex gap-2 items-center">
              <Input value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder={placeholder} className="text-sm" />
              <Button onClick={()=>{ if(msg.trim()) { onSend(msg.trim()); setMsg(""); } }}>Invia</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}