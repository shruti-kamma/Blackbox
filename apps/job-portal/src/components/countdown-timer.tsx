"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate?: string;
}

export function CountdownTimer({ targetDate = "2026-12-03T00:00:00+05:30" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isMounted: boolean;
  }>({
    days: 109,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isMounted: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isMounted: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isMounted: true });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (num: number) => String(num).padStart(2, "0");

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label="Countdown to 3 December 2026"
      className="w-full max-w-4xl mx-auto px-4 py-6"
    >
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 font-mono text-xl sm:text-3xl md:text-5xl font-extrabold tracking-wider text-foreground">
        <div className="flex items-baseline gap-1.5 bg-card/60 backdrop-blur-md border border-border/80 px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-lg">
          <span className="tabular-nums text-primary font-bold">
            {timeLeft.isMounted ? pad(timeLeft.days) : "109"}
          </span>
          <span className="text-xs sm:text-sm font-sans font-semibold text-muted-foreground uppercase tracking-widest ml-1">
            DAYS
          </span>
        </div>

        <span className="text-primary/70 font-light text-2xl sm:text-4xl hidden sm:inline">:</span>

        <div className="flex items-baseline gap-1.5 bg-card/60 backdrop-blur-md border border-border/80 px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-lg">
          <span className="tabular-nums text-primary font-bold">
            {timeLeft.isMounted ? pad(timeLeft.hours) : "00"}
          </span>
          <span className="text-xs sm:text-sm font-sans font-semibold text-muted-foreground uppercase tracking-widest ml-1">
            HOURS
          </span>
        </div>

        <span className="text-primary/70 font-light text-2xl sm:text-4xl hidden sm:inline">:</span>

        <div className="flex items-baseline gap-1.5 bg-card/60 backdrop-blur-md border border-border/80 px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-lg">
          <span className="tabular-nums text-primary font-bold">
            {timeLeft.isMounted ? pad(timeLeft.minutes) : "00"}
          </span>
          <span className="text-xs sm:text-sm font-sans font-semibold text-muted-foreground uppercase tracking-widest ml-1">
            MINUTES
          </span>
        </div>

        <span className="text-primary/70 font-light text-2xl sm:text-4xl hidden sm:inline">:</span>

        <div className="flex items-baseline gap-1.5 bg-card/60 backdrop-blur-md border border-border/80 px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-lg">
          <span className="tabular-nums text-primary font-bold">
            {timeLeft.isMounted ? pad(timeLeft.seconds) : "00"}
          </span>
          <span className="text-xs sm:text-sm font-sans font-semibold text-muted-foreground uppercase tracking-widest ml-1">
            SECONDS
          </span>
        </div>
      </div>
    </div>
  );
}
