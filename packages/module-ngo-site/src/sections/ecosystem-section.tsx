import { EcosystemVisual } from "./ecosystem-visual";

const PILLARS = [
  { title: "People", description: "Persons with disabilities, families, communities and civil society." },
  { title: "Policy", description: "Government, education, institutions, laws and enabling systems." },
  { title: "Partnerships", description: "Employers, businesses, technology, funders and ecosystem organisations." },
];

// The signature visual element of the site, per the brief — same
// EcosystemVisual as the hero, shown larger here as the standalone
// "philosophy" statement rather than a hero decoration.
export function EcosystemSection() {
  return (
    <section className="border-b border-border py-16 md:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
        <div className="order-2 md:order-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">People &bull; Policy &bull; Partnerships</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Meaningful change happens when people, systems and organisations work together.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3 md:grid-cols-1">
            {PILLARS.map((pillar) => (
              <div key={pillar.title}>
                <h3 className="text-lg font-bold text-foreground">{pillar.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 flex justify-center md:order-2">
          <EcosystemVisual className="h-auto w-full max-w-md" />
        </div>
      </div>
    </section>
  );
}
