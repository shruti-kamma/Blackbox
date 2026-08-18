"use client";

import { CountdownTimer } from "./countdown-timer";

export function BoxOpensVisual() {
  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-8">
      {/* Ambient background glow ring */}
      <div
        className="absolute inset-0 z-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-3xl opacity-50 rounded-3xl transform scale-95"
        aria-hidden="true"
      />

      {/* Main 3D Box Visual Container */}
      <div className="relative z-10 overflow-hidden rounded-3xl border border-primary/40 bg-card/80 backdrop-blur-xl shadow-2xl p-8 sm:p-12 md:p-16 text-center group transition-all duration-500 hover:border-primary/70 hover:shadow-[0_0_50px_rgba(167,139,250,0.25)]">
        {/* Decorative corner brackets / technical box cues */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary/60" aria-hidden="true" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary/60" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary/60" aria-hidden="true" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary/60" aria-hidden="true" />

        {/* Floating subtle animation pulse indicator */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-6 backdrop-blur-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          Countdown Active
        </div>

        {/* MAIN VISUAL HOOK: THE BOX OPENS */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase text-foreground font-sans drop-shadow-sm">
          <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            THE BOX OPENS
          </span>
        </h2>

        {/* Target Launch Date */}
        <p className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-primary font-sans">
          03 DECEMBER 2026
        </p>

        {/* Live Countdown */}
        <div className="mt-8">
          <CountdownTimer targetDate="2026-12-03T00:00:00+05:30" />
        </div>
      </div>
    </div>
  );
}
