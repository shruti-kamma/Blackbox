const STATS = [
  { value: "1", label: "Year" },
  { value: "1,000", label: "Employers" },
  { value: "1,000", label: "Educational Institutions" },
  { value: "10,000", label: "Opportunities" },
];

// A standalone, visually strong block for the flagship national
// challenge. Numbers are targets, not current results — this component
// is built to later accept live data (a `current` count per stat) once
// the initiative actually launches; no such data exists yet.
//
// The gradient is applied only to the numerals (bg-clip-text), not as a
// full-section background — a full-bleed secondary→primary background
// would swing from dark navy to light lavender in dark mode, and no
// single text color keeps readable contrast across that whole range.
export function OpportunitiesSection() {
  return (
    <section className="border-b border-border bg-card py-16 md:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">10,000 Opportunities</h2>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          One year. 1,000 employers. 1,000 educational institutions. 10,000 opportunities.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-3xl font-extrabold tabular-nums text-transparent sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Every opportunity counted. Every placement tracked. Every outcome measured.
        </p>

        <div className="mt-6">
          <a
            href="#get-involved"
            className="inline-flex h-touch-target items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Join the Challenge
          </a>
        </div>
      </div>
    </section>
  );
}
