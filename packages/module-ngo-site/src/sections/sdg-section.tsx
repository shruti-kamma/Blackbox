import { RELEVANT_SDGS } from "../data/sdgs";

// Original simple numbered badges, not the official UN SDG artwork —
// external image assets can't be fetched in this environment. Swap for
// the official icons (https://www.un.org/sustainabledevelopment/news/communications-material/)
// before this ships broadly.
export function SdgSection() {
  return (
    <section className="border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our work. India&rsquo;s goals.</h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {RELEVANT_SDGS.map((sdg) => (
            <div key={sdg.number} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
                {sdg.number}
              </span>
              <h3 className="mt-3 text-sm font-bold text-foreground">{sdg.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{sdg.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://sdgs.un.org/goals"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-primary hover:underline"
          >
            See how our work contributes &rarr; <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
