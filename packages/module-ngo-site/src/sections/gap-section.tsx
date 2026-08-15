const JOURNEY = ["Intent", "Implementation", "Access", "Participation", "Opportunity", "Outcome"];

export function GapSection() {
  return (
    <section className="border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          The intent exists. The challenge is turning it into outcomes.
        </h2>
        <p className="mt-4 text-muted-foreground">
          India&rsquo;s disability framework provides important rights and provisions, but implementation, access,
          participation, employment and measurable outcomes remain fragmented.
        </p>

        <div className="mt-10 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
          {JOURNEY.map((step, i) => (
            <div key={step} className="flex items-center gap-2 sm:gap-0">
              <span
                className={
                  i === 1
                    ? "rounded-full border-2 border-primary bg-background px-4 py-2 text-sm font-semibold text-primary"
                    : "rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground"
                }
              >
                {step}
              </span>
              {i < JOURNEY.length - 1 && (
                <span aria-hidden="true" className="mx-2 hidden text-muted-foreground sm:inline">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          The implementation gap sits between intent and access &mdash; where most opportunity is currently lost.
        </p>

        <div className="mt-8">
          <a href="#impact" className="text-sm font-semibold text-primary hover:underline">
            Understand the gap &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
