import Link from "next/link";
import { redirect } from "next/navigation";
import { MATCH_THRESHOLD } from "@blackbox/matching-engine";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { PortalSelectTrigger } from "@/components/a11y/portal-select-trigger";
import { HeroShapeGrid } from "@/components/hero-shape-grid";

// The umbrella "Blackbox" landing page — the actual front door of the site.
export default async function Home() {
  const user = await getCurrentUser();
  if (user?.role === "CANDIDATE") redirect("/candidate/jobs");
  if (user?.role === "EMPLOYER") redirect("/employer");
  if (user?.role === "ADMIN") redirect("/admin");

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

  return (
    <main className="flex flex-1 flex-col">
      {/* Full-Screen Landing Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30 min-h-[calc(100vh-4.25rem)] flex flex-col justify-between py-12 md:py-16">
        <div className="absolute inset-0 z-0 opacity-60">
          <HeroShapeGrid />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 flex-1 flex flex-col justify-center text-left font-sans">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide text-primary w-fit mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Blackbox India&apos;s Inclusion Intelligence Index
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground font-sans max-w-4xl leading-[1.1]">
            What Gets Measured <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Gets Improved
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground font-sans leading-relaxed">
            One platform where candidates with disabilities find genuinely matched roles, and employers hire
            against real, enforced accommodation commitments — not just promises.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <PortalSelectTrigger className="flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-all cursor-pointer">
              Explore Blackbox Jobs →
            </PortalSelectTrigger>
            <Link
              href="/ranking"
              className="flex h-12 items-center justify-center rounded-lg border-2 border-border bg-background px-8 text-base font-semibold text-foreground hover:bg-muted transition-all"
            >
              See Rankings
            </Link>
          </div>
        </div>

        {/* First Scroll Reveal Indicator */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-4 flex items-center justify-center">
          <a
            href="#products"
            className="flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <span>Scroll to explore</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 animate-bounce text-primary group-hover:translate-y-1 transition-transform"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* Revealed on First Scroll: Two products */}
      <section id="products" className="scroll-mt-16 border-b border-border bg-muted py-20">
        <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 md:grid-cols-2">
          <PortalSelectTrigger className="flex flex-col items-start gap-4 rounded-xl border-2 border-primary bg-background p-8 text-left shadow-sm hover:shadow-xl transition-all">
            <span className="rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold tracking-wide text-primary uppercase">
              Blackbox Jobs
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">The hiring platform</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Candidates build a verified profile, take one accessibility-adjusted assessment, and get matched
              to roles that already fit. Employers hire against enforced accommodation commitments.
            </p>
            <span className="mt-2 text-base font-semibold text-primary">Enter Blackbox Jobs →</span>
          </PortalSelectTrigger>

          <Link
            href="/ranking"
            className="flex flex-col items-start gap-4 rounded-xl border-2 border-border bg-background p-8 text-left shadow-sm hover:shadow-xl transition-all"
          >
            <span className="rounded-full bg-muted px-3.5 py-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Blackbox Rankings
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">The accountability layer</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              A public, ongoing score of how well employers actually deliver on disability inclusion — built
              from real candidate reviews and accommodation history, not a self-submitted survey.
            </p>
            <span className="mt-2 text-base font-semibold text-foreground">See the rankings →</span>
          </Link>
        </div>
      </section>

      {/* Real, live stats */}
      <section className="border-b border-border py-16">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-8 px-4 sm:grid-cols-4">
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-extrabold tabular-nums text-transparent">
              {openJobsCount}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Open roles</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-extrabold tabular-nums text-transparent">
              {organizationsCount}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Organizations hiring</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-extrabold tabular-nums text-transparent">
              {DISABILITY_CATEGORY_OPTIONS.length}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Disability categories supported</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl font-extrabold tabular-nums text-transparent">
              {MATCH_THRESHOLD}%
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Minimum fit to ever appear as a match</p>
          </div>
        </div>
      </section>

      {/* Why one website, not two */}
      <section className="border-b border-border bg-muted py-20">
        <div className="mx-auto w-full max-w-3xl px-4 text-center">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">Why one website, not two</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-balance text-foreground">
            Jobs and Rankings run on the same data — so the site is built to feel like it.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            A ranking isn&apos;t a separate opinion about a company; it&apos;s built from the same accommodation
            history and candidate reviews the hiring side already tracks. The scoring pipeline that populates it
            is still catching up on real company data — see{" "}
            <Link href="/ranking/methodology" className="font-semibold text-primary underline">
              the methodology
            </Link>{" "}
            for how it works.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="bg-primary py-20">
        <div className="mx-auto w-full max-w-3xl px-4 text-center text-primary-foreground">
          <p className="text-xs font-semibold tracking-wide uppercase opacity-80">The mission, in one line</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Make accessibility enforceable, not just a form field.
          </h2>
          <p className="mt-4 text-lg opacity-90 leading-relaxed">
            Every mechanism on Blackbox either verifies something real, gates on something real, or holds
            someone accountable for something real — on the hiring side and the rankings side alike.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PortalSelectTrigger className="flex h-12 items-center justify-center rounded-lg bg-background px-8 text-base font-semibold text-foreground hover:opacity-90 transition-all cursor-pointer">
              Job portal →
            </PortalSelectTrigger>
            <Link
              href="/login"
              className="flex h-12 items-center justify-center rounded-lg border-2 border-primary-foreground px-8 text-base font-semibold hover:bg-primary-foreground/10 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
