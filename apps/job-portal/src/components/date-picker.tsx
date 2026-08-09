"use client";

import { useEffect, useRef, useState } from "react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function formatDisplay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// Button-triggered popup calendar — a <button> can't be typed into, so this
// forces selection-from-calendar rather than manual entry, per the client's
// explicit request. Year/month dropdowns are included since a date of birth
// is commonly decades back — clicking prev/next one month at a time would
// take hundreds of clicks otherwise.
export function DatePicker({
  id,
  label,
  value,
  onChange,
  helperText,
}: {
  id: string;
  label: string;
  value: string; // ISO "yyyy-mm-dd" or ""
  onChange: (value: string) => void;
  helperText?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const initial = value ? value.split("-").map(Number) : null;
  const [viewYear, setViewYear] = useState(initial ? initial[0] : today.getFullYear() - 25);
  const [viewMonth, setViewMonth] = useState(initial ? initial[1] - 1 : today.getMonth());

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const years = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  function selectDay(day: number) {
    onChange(toIso(viewYear, viewMonth, day));
    setOpen(false);
  }

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="h-touch-target flex w-full items-center justify-between rounded-md border border-border bg-background px-3 text-left text-foreground"
      >
        <span className={value ? "" : "text-muted-foreground"}>
          {value ? formatDisplay(value) : "Select date…"}
        </span>
        <span aria-hidden="true">📅</span>
      </button>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}

      {open && (
        <div
          role="dialog"
          aria-label={`Choose ${label.toLowerCase()}`}
          className="absolute top-full z-10 mt-1 w-72 rounded-md border border-border bg-background p-3 shadow-md"
        >
          <div className="flex items-center gap-2">
            <select
              aria-label="Month"
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="h-touch-target flex-1 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="h-touch-target w-24 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {WEEKDAY_LABELS.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const iso = toIso(viewYear, viewMonth, day);
              const isSelected = iso === value;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  aria-current={isSelected ? "date" : undefined}
                  aria-label={formatDisplay(iso)}
                  className={`flex size-9 items-center justify-center rounded-md text-sm ${
                    isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 text-xs font-medium text-primary underline"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}
