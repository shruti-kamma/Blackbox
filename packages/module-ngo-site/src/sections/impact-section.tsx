const PILLARS = [
  { title: "Data Intelligence", description: "Building the foundation for evidence-based disability benchmarking." },
  { title: "Employer Intelligence", description: "Understanding how organisations create opportunities for persons with disabilities." },
  { title: "Education Intelligence", description: "Mapping enrolment, participation and pathways from education to employment." },
  { title: "Opportunity Infrastructure", description: "Connecting talent, employers, institutions and opportunities." },
  { title: "Ecosystem Intelligence", description: "Understanding how People, Policy and Partnerships can work together." },
];

const FUTURE_METRICS = [
  "People Employed",
  "Opportunities Created",
  "Students Connected",
  "Enterprises Enabled",
  "Employers Engaged",
  "Systems Improved",
];

// Explicitly early-stage framing per the brief — no invented beneficiary
// counts, placements, employers, students, or geographic reach.
export function ImpactSection() {
  return (
    <section id="impact" className="scroll-mt-16 border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Our Impact</h2>
          <p className="mt-4 text-muted-foreground">
            Blackbox is at an early stage. Rather than overstate our reach, we are building the measurement systems,
            intelligence, platforms and partnerships required to create and track meaningful outcomes at scale.
          </p>
          <p className="mt-3 text-sm font-semibold text-primary">Building the infrastructure for measurable impact.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground">{pillar.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm font-semibold text-foreground">Our impact will ultimately be measured by:</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {FUTURE_METRICS.map((metric) => (
              <li key={metric} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {metric}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
