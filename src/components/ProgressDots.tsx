"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type DayStatus = 0 | 1 | -1; // 0 = vuoto, 1 = verde, -1 = rosso

type Props = {
  year?: number;               // default: anno corrente
  storageKey?: string;         // default: "progress:YYYY"
  startMonth?: number;         // 0-11, default 0
  endMonth?: number;           // 0-11, default 11
};

const monthNames = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

function verdict(pGood: number) {
  if (pGood >= 95) return { label: "Fenomeno 🔥", hint: "Mantieni questo ritmo e i risultati esplodono.", tone: "success" };
  if (pGood >= 90) return { label: "Top 💪", hint: "Stai facendo le cose giuste, continua così.", tone: "good" };
  if (pGood >= 85) return { label: "Buon ritmo 🙂", hint: "Piccoli aggiustamenti e sali di livello.", tone: "ok" };
  if (pGood >= 80) return { label: "Ok, risultati lenti ⚖️", hint: "Punta ad almeno 90% per progressi visibili.", tone: "slow" };
  return { label: "Serve più coerenza 🚀", hint: "Mira a 5–6 giorni verdi a settimana.", tone: "warn" };
}

export function ProgressDots({
  year = new Date().getFullYear(),
  storageKey,
  startMonth = 0,
  endMonth = 11,
}: Props) {
  const key = storageKey ?? `progress:${year}`;
  const [days, setDays] = useState<DayStatus[]>(() => Array(isLeap(year) ? 366 : 365).fill(0));

  // load/save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as DayStatus[];
        if (Array.isArray(parsed)) setDays(normalizeLength(parsed, days.length));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(days));
    } catch {}
  }, [key, days]);

  const stats = useMemo(() => {
    const green = days.filter(d => d === 1).length;
    const red   = days.filter(d => d === -1).length;
    const tracked = green + red;
    const pTracked = tracked ? Math.round((green / tracked) * 100) : 0;
    const pYear = Math.round((green / days.length) * 100);
    return { green, red, tracked, pTracked, pYear, verdict: verdict(pTracked) };
  }, [days]);

  function toggleDay(idx: number) {
    setDays(prev => {
      const next = [...prev];
      next[idx] = cycle(next[idx]);
      return next;
    });
  }

  const months = buildMonths(year, startMonth, endMonth);

  return (
    <div className="space-y-3">
      {/* Header semplice & motivazionale */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <div className="font-semibold">{stats.verdict.label}</div>
          <div className="text-muted-foreground">{stats.verdict.hint}</div>
        </div>
        <Badge className="bg-[#FF6B00] text-white">{stats.pTracked}% tracciati</Badge>
      </div>
      <div className="text-xs text-muted-foreground">
        Verde = giorno OK (pasti/allenamento). Rosso = sgarro. Vuoto = non tracciato. Punta a <span className="font-medium">≥90%</span> per risultati visibili in 4–6 settimane, <span className="font-medium">≥95%</span> livello élite.
      </div>

      {/* Griglia per mesi (mobile-first) */}
      <div className="space-y-4">
        {months.map(m => (
          <div key={m.month} className="">
            <div className="mb-2 text-xs font-medium text-muted-foreground">{monthNames[m.month]} {year}</div>
            <div className="grid grid-cols-15 gap-2">
              {m.days.map((dayIndex) => {
                const status = days[dayIndex];
                return (
                  <button
                    key={dayIndex}
                    onClick={() => toggleDay(dayIndex)}
                    aria-label={`Giorno ${dayIndex + 1}`}
                    className={cn(
                      "h-4 w-4 rounded-full transition-transform active:scale-90",
                      "border",
                      status === 0 && "bg-muted/40 border-transparent",
                      status === 1 && "bg-emerald-500 border-emerald-600 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]",
                      status === -1 && "bg-rose-500 border-rose-600 shadow-[0_0_0_1px_rgba(244,63,94,0.3)]"
                    )}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer con numeri chiari */}
      <div className="text-xs text-muted-foreground">
        Verde: <span className="font-medium">{stats.green}</span> • Rosso: <span className="font-medium">{stats.red}</span> • Tracciati: <span className="font-medium">{stats.tracked}</span> • Anno (verdi): <span className="font-medium">{stats.pYear}%</span>
      </div>
    </div>
  );
}

/* ===== helpers ===== */
function isLeap(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function normalizeLength(arr: DayStatus[], len: number): DayStatus[] {
  if (arr.length === len) return arr;
  if (arr.length > len) return arr.slice(0, len);
  return [...arr, ...Array(len - arr.length).fill(0 as DayStatus)];
}
function cycle(v: DayStatus): DayStatus {
  // 0 -> 1 (verde) -> -1 (rosso) -> 0
  if (v === 0) return 1;
  if (v === 1) return -1;
  return 0;
}
function buildMonths(year: number, startMonth: number, endMonth: number) {
  const months: { month: number; days: number[] }[] = [];
  let dayCursor = 0;
  for (let m = 0; m < 12; m++) {
    const nDays = new Date(year, m + 1, 0).getDate();
    const indices = Array.from({ length: nDays }, (_, i) => dayCursor + i);
    if (m >= startMonth && m <= endMonth) {
      months.push({ month: m, days: indices });
    }
    dayCursor += nDays;
  }
  return months;
}