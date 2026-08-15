"use client";

import { useEffect, useState } from "react";

// Midnight IST on the reveal date.
const TARGET = new Date("2026-12-03T00:00:00+05:30").getTime();

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getRemaining(): Remaining {
  const diff = Math.max(0, TARGET - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Computed and started client-side only — a server-rendered countdown
// would show a value already stale by the time it reaches the browser,
// and would mismatch on hydration.
export function CountdownTimer() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    setRemaining(getRemaining());
    const interval = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!remaining) return null;

  const units: { label: string; value: number }[] = [
    { label: "DAYS", value: remaining.days },
    { label: "HOURS", value: remaining.hours },
    { label: "MINUTES", value: remaining.minutes },
    { label: "SECONDS", value: remaining.seconds },
  ];

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`${remaining.days} days, ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds until the box opens`}
      className="flex flex-wrap items-start justify-center gap-3 sm:gap-5"
    >
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-start gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <span className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {pad(unit.value)}
            </span>
            <span className="mt-1 text-[10px] font-semibold tracking-widest text-muted-foreground sm:text-xs">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="pt-0.5 font-mono text-3xl font-bold text-primary sm:text-5xl" aria-hidden="true">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
