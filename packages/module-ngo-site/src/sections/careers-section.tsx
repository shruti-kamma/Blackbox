import { CAREER_PATHWAYS } from "../data/careers";

export function CareersSection() {
  return (
    <section id="careers" className="scroll-mt-16 border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Careers</h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {CAREER_PATHWAYS.map((pathway) => (
            <div key={pathway.title} className="rounded-2xl border border-border bg-background p-6 text-center shadow-sm">
              <h3 className="text-lg font-bold text-foreground">{pathway.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{pathway.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="#contact" className="text-sm font-semibold text-primary hover:underline">
            View Opportunities &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
