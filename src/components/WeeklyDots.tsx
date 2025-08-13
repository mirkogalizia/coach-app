"use client";

import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirebase } from "@/components/FirebaseProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

type DayStatus = 0 | 1 | -1;
const daysIT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export function WeeklyDots() {
  const { user } = useFirebase();
  const now = new Date();
  const { weekKey, startISO } = getCurrentWeekKey(now);
  const storageKey = `progress:week:${weekKey}`;

  const [week, setWeek] = useState<DayStatus[]>(() => Array(7).fill(0));
  const [openInfo, setOpenInfo] = useState(false);

  // --- Sync: Firestore se loggato, altrimenti localStorage ---
  useEffect(() => {
    if (!user) {
      // localStorage mode
      try {
        const raw = localStorage.getItem(storageKey);
        setWeek(raw ? (JSON.parse(raw) as DayStatus[]) : Array(7).fill(0));
      } catch {
        setWeek(Array(7).fill(0));
      }
      return;
    }
    // Firestore mode
    const ref = doc(db, "users", user.uid, "weeks", weekKey);
    // live subscribe
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as { days: DayStatus[] };
        if (Array.isArray(data.days) && data.days.length === 7) setWeek(data.days);
      }
    });
    // fetch initial (in caso non esista)
    getDoc(ref).then((snap) => {
      if (!snap.exists()) setDoc(ref, { days: Array(7).fill(0), startISO }, { merge: true });
    });
    return () => unsub();
  }, [user, storageKey, weekKey, startISO]);

  // salva
  useEffect(() => {
    if (!user) {
      try { localStorage.setItem(storageKey, JSON.stringify(week)); } catch {}
      return;
    }
    const ref = doc(db, "users", user.uid, "weeks", weekKey);
    setDoc(ref, { days: week, startISO }, { merge: true }).catch(()=>{});
  }, [user, week, weekKey, startISO, storageKey]);

  const todayIdx = getWeekdayIndexMonFirst(now);

  function toggle(idx: number) {
    setWeek((prev) => {
      const next = [...prev];
      next[idx] = cycle(next[idx]);
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
    stats.p >= 80 ? "Ok, lenti ⚖️"  :
                    "Più coerenza 🚀";

  return (
    <>
      <GlassCard>
        <CardHeader className="pt-2 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
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

        <CardContent className="p-3 pt-1 space-y-2">
          <div className="text-[11px] text-muted-foreground">
            Punta a <span className="font-medium">≥90%</span> verdi (≥95% top). Verde = ok, Rosso = sgarro.
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div>{formatRange(startISO)}</div>
            <div className="text-right">{verdict}</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {week.map((status, idx) => {
              const isToday = idx === todayIdx;
              return (
                <button
                  key={idx}
                  onClick={() => toggle(idx)}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-transform active:scale-95 mx-auto",
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

          <div className="grid grid-cols-7 gap-1.5 text-[10px] text-muted-foreground">
            {daysIT.map((d) => (
              <div key={d} className="text-center leading-none">{d}</div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Verdi: {stats.green} • Rossi: {stats.red}</span>
            <span>Tracciati: {stats.green + stats.red}/7</span>
          </div>
        </CardContent>
      </GlassCard>

      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Come usare i pallini</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>Pensa l’anno come <b>365 giorni</b>: giorno “ok” = <span className="text-emerald-600 font-medium">verde</span>, sgarro = <span className="text-rose-600 font-medium">rosso</span>.</p>
            <p>Mantieni almeno il <b>90%</b> di verdi per progressi visibili. Con <b>≥95%</b> i risultati sono top.</p>
            <p className="text-muted-foreground">Tocca un pallino per cambiare stato: vuoto → verde → rosso.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ===== Helpers ===== */
function getWeekdayIndexMonFirst(d: Date) {
  const js = d.getDay();
  return (js + 6) % 7;
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
  if (v === 0) return 1;
  if (v === 1) return -1;
  return 0;
}