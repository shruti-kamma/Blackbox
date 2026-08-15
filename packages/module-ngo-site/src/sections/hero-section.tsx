import { Button } from "@blackbox/ui";
import { EcosystemVisual } from "./ecosystem-visual";

export function HeroSection() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Blackbox Global Foundation</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            From intent to action.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            India has progressive provisions for the education and employment of persons with disabilities. Yet a
            significant gap remains between what the system intends to achieve and what persons with disabilities
            experience in reality.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Blackbox Global Foundation works to close this gap by building the data, platforms, networks and
            pathways that turn inclusion into participation, education, employment and economic opportunity.
          </p>
          <p className="mt-6 text-lg font-semibold text-primary">Because what gets measured, gets improved.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="default">
              <a href="#initiatives">Explore Our Flagship Initiatives</a>
            </Button>
            <Button asChild variant="secondary" size="default">
              <a href="#contact">Partner With Us</a>
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <EcosystemVisual className="h-auto w-full max-w-sm" />
        </div>
      </div>
    </section>
  );
}
