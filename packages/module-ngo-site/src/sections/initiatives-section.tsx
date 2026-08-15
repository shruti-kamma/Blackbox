import Link from "next/link";
import { INITIATIVES } from "../data/initiatives";

function isExternalRoute(href: string) {
  return href.startsWith("/");
}

export function InitiativesSection() {
  return (
    <section id="initiatives" className="scroll-mt-16 border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our Flagship Initiatives</h2>
          <p className="mt-3 text-muted-foreground">Building practical solutions across the disability ecosystem.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {INITIATIVES.map((initiative) => (
            <div
              key={initiative.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-foreground">{initiative.title}</h3>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{initiative.subtitle}</p>
              <p className="text-sm text-muted-foreground">{initiative.description}</p>

              {initiative.flow && (
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                  {initiative.flow.map((step, i) => (
                    <span key={step} className="flex items-center gap-1.5">
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">{step}</span>
                      {i < initiative.flow!.length - 1 && <span aria-hidden="true">&rarr;</span>}
                    </span>
                  ))}
                </p>
              )}
              {initiative.stats && (
                <p className="mt-1 flex flex-wrap gap-2 text-xs">
                  {initiative.stats.map((stat) => (
                    <span key={stat} className="rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">
                      {stat}
                    </span>
                  ))}
                </p>
              )}

              {isExternalRoute(initiative.ctaHref) ? (
                <Link href={initiative.ctaHref} className="mt-2 text-sm font-semibold text-primary hover:underline">
                  {initiative.ctaLabel} &rarr;
                </Link>
              ) : (
                <a href={initiative.ctaHref} className="mt-2 text-sm font-semibold text-primary hover:underline">
                  {initiative.ctaLabel} &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
