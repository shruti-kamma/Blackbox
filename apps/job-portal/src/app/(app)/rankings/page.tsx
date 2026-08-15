import Link from "next/link";
import { redirect } from "next/navigation";
import { MATCH_THRESHOLD } from "@blackbox/matching-engine";
import { getAllOrgs } from "@blackbox/rankings-data";
import { RankingsHighlights, InstitutionSearch } from "@blackbox/module-leaderboards";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { PortalSelectTrigger } from "@/components/a11y/portal-select-trigger";
import { HeroShapeGrid } from "@/components/hero-shape-grid";

// The Rankings landing page — hero, live top-scorers teaser, institution
// search, product pitch, and About section all live here at /rankings.
// The bare "/" is the separate NGO landing page (see app/page.tsx); the
// job portal itself lives at /nexo.
export default async function Home() {
  const user = await getCurrentUser();
  if (user?.role === "CANDIDATE") redirect("/nexo/candidate/jobs");
  if (user?.role === "EMPLOYER") redirect("/nexo/employer");
  if (user?.role === "ADMIN") redirect("/nexo/admin");

  let openJobsCount = 0;
  let organizationsCount = 0;
  try {
    [openJobsCount, organizationsCount] = await Promise.all([
      prisma.job.count({ where: { isOpen: true } }),
      prisma.organization.count(),
    ]);
  } catch (error) {
    console.warn("Database connection offline, using fallback metrics");
  }

  const orgs = await getAllOrgs();
  const searchOptions = orgs.map((o) => ({ slug: o.slug, name: o.name, type: o.type }));

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30 min-h-[calc(100vh-4.25rem)] flex flex-col justify-between py-12 md:py-16">
        <div className="absolute inset-0 z-0 opacity-80">
          <HeroShapeGrid />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 flex-1 flex flex-col justify-center text-left font-sans">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground font-sans inline-flex items-center gap-2">
            <span>Blackbox INDEX</span>
            <sup className="text-xl sm:text-3xl font-extrabold text-primary select-none">™</sup>
          </h1>

          <p className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-primary font-sans">
            (India&rsquo;s National Disability Ecosystem Exchange)
          </p>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
            India&apos;s first unified accessibility and inclusion intelligence platform — matching candidates with disabilities to verified roles while tracking real, enforced employer accommodation commitments.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <InstitutionSearch options={searchOptions} />
            <Link
              href="/rankings/companies"
              className="flex h-touch-target shrink-0 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Discover all institutions
            </Link>
          </div>
        </div>

        {/* First Scroll Reveal Indicator */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-4 flex items-center justify-center">
          <a
            href="#rankings"
            aria-label="Scroll to next section"
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 animate-bounce text-primary group-hover:translate-y-1 transition-transform"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Live proof this is real, not a mockup — the actual top scorers
          from the rankings pipeline, right on the front door. */}
      <RankingsHighlights />

      {/* Two products */}
      <section id="rankings" className="scroll-mt-16 border-b border-border bg-muted py-14 md:py-20">
        <div className="mx-auto w-full max-w-5xl px-4 text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
            What Gets Measured, <span className="text-primary">Gets Improved</span>
          </h2>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 md:grid-cols-2">
          <PortalSelectTrigger className="flex flex-col items-start gap-3 rounded-lg border-2 border-primary bg-background p-7 text-left hover:shadow-md">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
              Blackbox Jobs
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">The hiring platform</h2>
            <p className="text-sm text-muted-foreground">
              Candidates build a verified profile, take one accessibility-adjusted assessment, and get matched
              to roles that already fit. Employers hire against enforced accommodation commitments.
            </p>
            <span className="mt-1 text-sm font-semibold text-primary">Enter Blackbox Jobs →</span>
          </PortalSelectTrigger>

          <Link
            href="/rankings/companies"
            className="flex flex-col items-start gap-3 rounded-lg border-2 border-border bg-background p-7 text-left hover:shadow-md"
          >
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Blackbox Rankings
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">The accountability layer</h2>
            <p className="text-sm text-muted-foreground">
              A public, ongoing score of how well employers actually deliver on disability inclusion — built
              from real candidate reviews and accommodation history, not a self-submitted survey.
            </p>
            <span className="mt-1 text-sm font-semibold text-foreground">See the rankings →</span>
          </Link>
        </div>
      </section>

      {/* Real, live stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">
              {openJobsCount}
            </p>
            <p className="text-sm text-muted-foreground">Open roles</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">
              {organizationsCount}
            </p>
            <p className="text-sm text-muted-foreground">Organizations hiring</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">
              {DISABILITY_CATEGORY_OPTIONS.length}
            </p>
            <p className="text-sm text-muted-foreground">Disability categories supported</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">
              {MATCH_THRESHOLD}%
            </p>
            <p className="text-sm text-muted-foreground">Minimum fit to ever appear as a match</p>
          </div>
        </div>
      </section>

      {/* Why one website, not two */}
      <section className="border-b border-border bg-muted">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Why one website, not two</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-foreground">
            Jobs and Rankings run on the same data — so the site is built to feel like it.
          </h2>
          <p className="mt-3 text-muted-foreground">
            A ranking isn&apos;t a separate opinion about a company — it&apos;s built from that employer&apos;s own
            public disclosures, scored against a fixed methodology, not a self-submitted survey. 50 companies are
            live today, with employer accommodation history and candidate reviews from the hiring side planned as
            the next data source — see{" "}
            <Link href="/rankings/methodology" className="font-medium text-primary underline">
              the methodology
            </Link>{" "}
            for how it works.
          </p>
        </div>
      </section>

      {/* About / Motive Section */}
      <section id="about" className="scroll-mt-16 border-t border-border bg-background py-16 md:py-24">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wide text-primary uppercase">
              Our Purpose & Motive
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              Why Blackbox Exists
            </h2>
            <p className="mt-4 text-lg text-muted-foreground font-sans leading-relaxed">
              We are a purpose-built technology platform solving the systemic exclusion of persons with disabilities in the workforce through enforceable data and real accessibility.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Pillar 1 */}
            <div className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground font-sans">What We Are Solving</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Traditional hiring platforms treat disability inclusion as a superficial checkbox. Candidates face unadapted assessments and empty diversity statements without knowing if real workplace accommodations actually exist.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground font-sans">Driven By Purpose & Data</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Blackbox is an infrastructure of systemic accountability. We measure real accommodation track records and employee reviews to hold employers accountable against enforced commitments.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground font-sans">An Accessible Job Space</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                We provide candidates with disabilities a dedicated, screen-reader optimized platform to build verified profiles, take adapted skill evaluations, and secure roles that are pre-fitted for their specific needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
