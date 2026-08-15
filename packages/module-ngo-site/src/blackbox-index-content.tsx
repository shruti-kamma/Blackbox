import Link from "next/link";
import { getAllOrgs, MATURITY_LEVEL_LABELS, MATURITY_LEVEL_DOT_CLASS } from "@blackbox/rankings-data";
import { InstitutionSearch } from "@blackbox/module-leaderboards";
import { cn } from "@blackbox/ui";

const LOCKED_TABS = ["Benchmark", "Gap Analysis", "Roadmap", "Impact Simulator", "Progress Tracker", "Recognition"];

const FLOW = ["Current State", "Benchmark", "Gap", "Priority", "Roadmap", "Implement", "Measure", "Reassess"];

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

// The public-facing product/marketing page for Blackbox Index — distinct
// from the real, working dashboard at /rankings (built earlier this
// session). This page pitches the product and links through to the live
// tool; it doesn't duplicate the dashboard itself. Per the brief, the
// full 50-question methodology isn't exposed here, and any score data
// shown is explicitly labeled illustrative, never presented as real.
export async function BlackboxIndexContent() {
  const orgs = await getAllOrgs();
  const searchOptions = orgs.map((o) => ({ slug: o.slug, name: o.name, type: o.type }));

  return (
    <main>
      <section className="border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30 py-16 md:py-24">
        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Blackbox Index<span className="align-super text-xl">™</span>
          </h1>
          <p className="mt-3 text-lg font-semibold text-primary">India&rsquo;s National Disability Ecosystem Exchange</p>
          <p className="mt-6 text-muted-foreground">
            Blackbox Index™ is a data-driven benchmarking platform that measures how effectively employers in India
            support persons with disabilities across the employment journey, how educational institutions enable
            the journey from enrolment to employment, and how states strengthen the systems connecting education,
            employment, accessibility and inclusion.
          </p>
          <p className="mt-3 text-muted-foreground">
            By bringing together public data, institutional evidence and lived experiences, the Index establishes
            meaningful benchmarks, identifies gaps and drives measurable progress&mdash;because what gets measured,
            gets improved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/rankings"
              className="flex h-touch-target items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              View the Live Rankings
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <nav aria-label="Report sections" className="overflow-x-auto">
            <ul className="flex min-w-max gap-1">
              <li>
                <span
                  aria-current="page"
                  className="inline-block border-b-2 border-foreground px-4 py-3 text-sm font-semibold text-foreground"
                >
                  Snapshot
                </span>
              </li>
              {LOCKED_TABS.map((label) => (
                <li key={label}>
                  <span
                    className="inline-flex cursor-not-allowed items-center gap-1.5 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground/60"
                    title="Coming soon"
                  >
                    {label}
                    <LockIcon />
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <section className="border-b border-border bg-muted py-14 md:py-20">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How it works</h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {FLOW.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                  {step}
                </span>
                {i < FLOW.length - 1 && (
                  <span aria-hidden="true" className="text-muted-foreground">
                    &rarr;
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {MATURITY_LEVEL_LABELS.map((level) => (
              <span key={level} className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", MATURITY_LEVEL_DOT_CLASS[level])} />
                {level}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border py-14 md:py-20">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Illustrative example
          </p>
          <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">Sample Organisation Pvt. Ltd.</p>
                <p className="text-xs text-muted-foreground">Illustrative data, not a real assessment</p>
              </div>
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text font-serif text-3xl font-bold tabular-nums text-transparent">
                62
              </span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-foreground">
              <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", MATURITY_LEVEL_DOT_CLASS.Progressing)} />
              Progressing
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto w-full max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Find your organisation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your profile is currently based on publicly available information. Add verified information to improve
            the accuracy and completeness of your profile.
          </p>
          <div className="mt-6 flex justify-center">
            <InstitutionSearch options={searchOptions} />
          </div>
        </div>
      </section>
    </main>
  );
}
