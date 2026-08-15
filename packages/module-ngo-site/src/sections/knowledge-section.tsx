import { RESOURCE_CATEGORIES } from "../data/resources";

// Homepage teaser only — search + Topic/Audience/Format/Year filters
// (the brief's full spec for this section) are a follow-up, not built
// in this pass. See docs/decisions.md scope note for this package.
export function KnowledgeSection() {
  return (
    <section id="knowledge" className="scroll-mt-16 border-b border-border py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            The intelligence behind inclusion.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Research, data, frameworks, insights and practical resources for persons with disabilities and the
            wider ecosystem.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-9">
          {RESOURCE_CATEGORIES.map((category) => (
            <div
              key={category.label}
              className="rounded-xl border border-border bg-card px-3 py-4 text-center text-xs font-medium text-foreground"
            >
              {category.label}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="#contact" className="text-sm font-semibold text-primary hover:underline">
            Browse resources &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
