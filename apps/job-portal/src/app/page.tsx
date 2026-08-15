import { HeroShapeGrid } from "@/components/hero-shape-grid";
import { BoxOpensVisual } from "@/components/box-opens-visual";
import { StayConnectedForm } from "@/components/stay-connected-form";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ==========================================
          1. HERO
         ========================================== */}
      <section className="relative overflow-hidden border-b border-border min-h-[90vh] flex flex-col justify-center py-20 md:py-28">
        <div className="absolute inset-0 z-0 opacity-70" aria-hidden="true">
          <HeroShapeGrid />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 sm:px-8 text-center flex flex-col items-center">
          {/* Main Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-foreground uppercase font-sans">
            BLACKBOX
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-primary font-sans">
            Xclusively Inclusive.
          </p>

          {/* Sub-headline */}
          <p className="mt-6 text-xl sm:text-2xl font-bold tracking-normal text-foreground/90 font-sans">
            From intent to action.
          </p>

          {/* Core Problem Narrative */}
          <div className="mt-8 max-w-2xl space-y-4 text-base sm:text-lg md:text-xl text-muted-foreground font-sans leading-relaxed">
            <p>India has made important commitments towards inclusion.</p>
            <p>
              Yet a significant gap remains between what the system intends to achieve and what persons with disabilities experience in reality.
            </p>
            <p className="text-foreground font-medium">
              We are building something to help close that gap.
            </p>
          </div>

          {/* Driving Motto */}
          <div className="mt-12 inline-block rounded-2xl border border-primary/30 bg-primary/10 px-8 py-4 backdrop-blur-md">
            <p className="text-xl sm:text-2xl font-extrabold text-primary tracking-wide">
              What gets measured, gets improved.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. THE REVEAL
         ========================================== */}
      <section className="relative py-24 sm:py-32 md:py-40 bg-gradient-to-b from-background via-card/40 to-background border-b border-border">
        {/* Generous Whitespace Header */}
        <div className="mx-auto w-full max-w-4xl px-6 text-center">
          <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-primary/80 mb-6">
            Something is coming.
          </p>

          {/* Ecosystem Pillars */}
          <div className="my-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto px-4">
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm transition-all hover:border-primary/50">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider text-foreground">DATA.</span>
            </div>
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm transition-all hover:border-primary/50">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider text-foreground">OPPORTUNITY.</span>
            </div>
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm transition-all hover:border-primary/50">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider text-foreground">TECHNOLOGY.</span>
            </div>
            <div className="px-5 py-3 sm:px-6 sm:py-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm transition-all hover:border-primary/50">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider text-foreground">PARTNERSHIPS.</span>
            </div>
          </div>

          <p className="text-xl sm:text-2xl font-extrabold text-muted-foreground uppercase tracking-widest mb-16">
            One ecosystem.
          </p>
        </div>

        {/* Visual Hook & Countdown */}
        <BoxOpensVisual />
      </section>

      {/* ==========================================
          3. INDEPENDENCE DAY CONTEXT
         ========================================== */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border text-center bg-gradient-to-r from-[#FF9933]/15 via-background to-[#138808]/15 dark:from-[#FF9933]/20 dark:via-background dark:to-[#138808]/20">
        {/* Tricolor subtle top & bottom accent borders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-80" />

        {/* Ambient radial blur glowing spheres for Saffron & Green */}
        <div aria-hidden="true" className="absolute -top-12 -left-12 w-64 h-64 bg-[#FF9933]/25 dark:bg-[#FF9933]/20 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute -bottom-12 -right-12 w-64 h-64 bg-[#138808]/25 dark:bg-[#138808]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 flex flex-col items-center">
          {/* Subtle Ashoka Chakra Motif Icon */}
          <div className="mb-4 text-primary/80 opacity-90">
            <svg className="w-10 h-10 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor">
              <circle cx="50" cy="50" r="45" strokeWidth="3" />
              <circle cx="50" cy="50" r="8" strokeWidth="3" />
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x2 = 50 + 45 * Math.cos(rad);
                const y2 = 50 + 45 * Math.sin(rad);
                return <line key={i} x1="50" y1="50" x2={x2} y2={y2} strokeWidth="1.5" />;
              })}
            </svg>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-md p-8 sm:p-10 shadow-lg max-w-3xl">
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground leading-relaxed font-sans">
              On India’s 80th Independence Day, we begin a journey towards a more inclusive{" "}
              <span className="font-black inline-flex flex-wrap items-center justify-center gap-x-2">
                <span className="text-[#FF671F] drop-shadow-sm">Viksit</span>
                <span className="text-foreground">Bharat</span>
                <span className="text-[#138808] dark:text-[#22c55e] drop-shadow-sm">by 2047.</span>
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          4. THE MYSTERY
         ========================================== */}
      <section className="py-24 sm:py-32 bg-background border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-6 text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-muted-foreground">
              We aren’t ready to show you everything yet.
            </h2>
            <p className="text-xl sm:text-2xl font-semibold text-foreground">
              But we are ready to tell you this:
            </p>
          </div>

          <div className="py-6">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-primary">
              Something is being built.
            </h3>
          </div>

          {/* Curiosity Building Pillars */}
          <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="p-5 rounded-xl border border-border/80 bg-card/50 backdrop-blur-sm flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-lg font-bold text-foreground">Something that will measure.</span>
            </div>
            <div className="p-5 rounded-xl border border-border/80 bg-card/50 backdrop-blur-sm flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-lg font-bold text-foreground">Something that will connect.</span>
            </div>
            <div className="p-5 rounded-xl border border-border/80 bg-card/50 backdrop-blur-sm flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-lg font-bold text-foreground">Something that will enable.</span>
            </div>
            <div className="p-5 rounded-xl border border-border/80 bg-card/50 backdrop-blur-sm flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />
              <span className="text-lg font-bold text-foreground">Something that will create opportunity.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. STAY CONNECTED
         ========================================== */}
      <section id="stay-connected" className="py-24 sm:py-32 bg-card/40 border-b border-border">
        <div className="mx-auto w-full max-w-3xl px-6 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              Be the first to know.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-sans">
              Something is being built behind the Blackbox.
            </p>
          </div>

          <div className="pt-6">
            <StayConnectedForm />
          </div>
        </div>
      </section>

      {/* ==========================================
          6. FINAL SCREEN
         ========================================== */}
      <footer className="py-16 sm:py-24 bg-background text-center">
        <div className="mx-auto w-full max-w-3xl px-6 space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground uppercase">
            BLACKBOX
          </h2>
          <p className="text-xl sm:text-2xl font-bold text-primary tracking-wide">
            Xclusively Inclusive.
          </p>
          <p className="text-sm sm:text-base font-semibold text-muted-foreground uppercase tracking-widest pt-4">
            The box opens — 3 December 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
