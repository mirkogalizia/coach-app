"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type DayStatus = 0 | 1 | -1; // 0=vuoto, 1=verde (ok), -1=rosso (sgarro)
const daysIT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function WeeklyDots() {
  const now = new Date();
  const { weekKey, startISO } = getCurrentWeekKey(now);
  const storageKey = `progress:week:${weekKey}`;

  const [week, setWeek] = useState<DayStatus[]>(() => Array(7).fill(0));
  const [openInfo, setOpenInfo] = useState(false);

  // Load week
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DayStatus[];
        if (Array.isArray(parsed) && parsed.length === 7) setWeek(parsed);
      } else {
        setWeek(Array(7).fill(0));
      }
    } catch {}
  }, [storageKey]);

  // Save week
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(week));
    } catch {}
  }, [storageKey, week]);

  const todayIdx = getWeekdayIndexMonFirst(now);

  function toggle(idx: number) {
    setWeek((prev) => {
      const next = [...prev];
      next[idx] = cycle(next[idx]); // 0 -> 1 -> -1 -> 0
      return next;
    });
  }

  const stats = useMemo(() => {
    const green = week.filter((d) => d === 1).length;
    const red = week.filter((d) => d === -1).length;
    const tracked = green + red;
    const p = tracked ? Math.round((green / tracked) * 100) : 0;
    return { green, red, tracked, p };
  }, [week]);

  const verdict =
    stats.p >= 95 ? "Fenomeno 🔥" :
    stats.p >= 90 ? "Top 💪" :
    stats.p >= 85 ? "Buon ritmo 🙂" :
    stats.p >= 80 ? "Ok, risultati lenti ⚖️" :
                    "Serve più coerenza 🚀";

  return (
    <>
      <GlassCard>
        <CardHeader className="pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-semibold">Settimana in corso</div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/60"
              onClick={() => setOpenInfo(true)}
              aria-label="Spiegazione"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Badge className="bg-[#FF6B00] text-white">{stats.p}% ok</Badge>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-3">
          {/* RIGA BREVE (concetto chiave) */}
          <div className="text-xs text-muted-foreground">
            Punta a <span className="font-medium">≥90%</span> giorni verdi (≥95% top). Verde = ok, Rosso = sgarro.
          </div>

          {/* Range e verdetto */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>{formatRange(startISO)}</div>
            <div className="text-right">{verdict}</div>
          </div>

          {/* 7 PALLINI */}
          <div className="grid grid-cols-7 gap-2">
            {week.map((status, idx) => {
              const isToday = idx === todayIdx;
              return (
                <button
                  key={idx}
                  onClick={() => toggle(idx)}
                  className={cn(
                    "h-8 w-8 rounded-full border transition-transform active:scale-95 mx-auto",
                    status === 0 && "bg-muted/40 border-transparent",
                    status === 1 && "bg-emerald-500 border-emerald-600 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]",
                    status === -1 && "bg-rose-500 border-rose-600 shadow-[0_0_0_1px_rgba(244,63,94,0.3)]",
                    isToday && "ring-2 ring-[#FF6B00]/50"
                  )}
                  aria-label={`${daysIT[idx]} stato`}
                />
              );
            })}
          </div>

          {/* Etichette giorni */}
          <div className="grid grid-cols-7 gap-2 text-[10px] text-muted-foreground">
            {daysIT.map((d) => (
              <div key={d} className="text-center">{d}</div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Verde: {stats.green} • Rosso: {stats.red}</span>
            <span>Tracciati: {stats.green + stats.red}/7</span>
          </div>
        </CardContent>
      </GlassCard>

      {/* DIALOG INFO COMPLETO */}
      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Come usare i pallini</DialogTitle>
            <DialogDescription />
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              Pensa l’anno come <b>365 giorni</b>: ogni giorno che mangi bene, ti alleni e segui il piano è un
              <span className="text-emerald-600 font-medium"> giorno verde</span>. Ogni sgarro è un
              <span className="text-rose-600 font-medium"> giorno rosso</span>.
            </p>
            <p>
              Mantieni almeno il <b>90%</b> di giorni verdi per progressi visibili in 4–6 settimane.
              Con <b>≥95%</b> i risultati sono al top. Meno verdi ⇒ risultati più lenti.
            </p>
            <p className="text-muted-foreground">
              Tocca un pallino per cambiare stato: vuoto → verde → rosso.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ===== Helpers ===== */
function getWeekdayIndexMonFirst(d: Date) {
  const js = d.getDay(); // 0..6 (Sun..Sat)
  return (js + 6) % 7;   // 0..6 (Mon..Sun)
}
function getCurrentWeekKey(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);

  const monday = new Date(date);
  const mondayDayNum = monday.getUTCDay() || 7;
  monday.setUTCDate(monday.getUTCDate() - (mondayDayNum - 1));

  const y = date.getUTCFullYear();
  const weekKey = `${y}-W${String(weekNo).padStart(2, "0")}`;
  const startISO = monday.toISOString().slice(0, 10);
  return { weekKey, startISO };
}
function formatRange(startISO: string) {
  const start = new Date(startISO);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (dt: Date) => `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(start)} – ${fmt(end)}`;
}
function cycle(v: DayStatus): DayStatus {
  if (v === 0) return 1;   // vuoto -> verde
  if (v === 1) return -1;  // verde -> rosso
  return 0;                // rosso -> vuoto
}