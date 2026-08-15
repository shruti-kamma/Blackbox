const STEPS = [
  { n: "01", title: "Measure", description: "Understand gaps through data and intelligence." },
  { n: "02", title: "Connect", description: "Bring together people, institutions, employers and opportunities." },
  { n: "03", title: "Enable", description: "Build platforms, networks, skills and access." },
  { n: "04", title: "Create Opportunity", description: "Translate inclusion into education, employment, entrepreneurship and participation." },
];

export function ApproachSection() {
  return (
    <section className="border-b border-border py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Measure. Connect. Enable. Create Opportunity.
        </h2>

        <div className="mt-12 flex flex-col gap-6 md:flex-row md:gap-4">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex flex-1 items-start gap-4 md:flex-col md:items-start">
              <span className="font-serif text-3xl font-bold text-primary/40">{step.n}</span>
              <div>
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className="hidden self-center text-2xl text-border md:block">
                  &rarr;
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
