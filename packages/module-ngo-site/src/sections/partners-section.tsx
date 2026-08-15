import { PARTNER_CATEGORIES } from "../data/partners";

// Empty dashed-border slots, not fabricated partner logos — per the
// brief's explicit instruction not to invent partners.
export function PartnersSection() {
  return (
    <section className="border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Building the ecosystem together.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Meaningful change requires institutions, employers, government, academia, technology, funders and
            communities to work together.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PARTNER_CATEGORIES.map((category) => (
            <div
              key={category.label}
              className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border bg-background px-3 text-center text-xs font-medium text-muted-foreground"
            >
              {category.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
