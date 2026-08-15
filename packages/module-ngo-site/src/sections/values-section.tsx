import { VISION_MISSION_OBJECTIVE, CORE_VALUES } from "../data/values";

export function ValuesSection() {
  return (
    <section className="border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {VISION_MISSION_OBJECTIVE.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.label}</p>
              <p className="mt-2 text-sm text-foreground">{item.copy}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Our Values
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {CORE_VALUES.map((value) => (
            <div key={value.title} className="text-center">
              <h3 className="text-sm font-bold text-foreground">{value.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
