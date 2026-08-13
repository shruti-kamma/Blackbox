import Link from "next/link";
import { redirect } from "next/navigation";
import { MATCH_THRESHOLD } from "@blackbox/matching-engine";
import { RankingsHighlights } from "@blackbox/module-leaderboards";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { PortalSelectTrigger } from "@/components/a11y/portal-select-trigger";
import ShapeGrid from "@/components/ui/ShapeGrid";

// The umbrella "Blackbox" landing page — the actual front door of the site.
// Blackbox Jobs is one product reachable from here via the portal-select
// modal; Blackbox Rankings (ported from the shruti branch) is the second,
// living at /ranking — see app/ranking/layout.tsx for how its own font/
// theme/nav are scoped so they don't leak into the rest of this site.
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30">
        <div className="absolute inset-0 z-0 opacity-60">
          <ShapeGrid
            speed={0.25}
            squareSize={45}
            direction="diagonal"
            borderColor="#b9b8d7"
            hoverFillColor="transparent"
            shape="hexagon"
            hoverTrailAmount={0}
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-20 text-left md:py-28 font-sans">
          <p className="text-xl md:text-2xl font-medium tracking-tight text-primary font-sans">
            Blackbox India&apos;s Inclusion Intelligence Index
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground font-sans max-w-3xl leading-tight">
            What Gets Measured Gets Improved
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground font-sans">
            One platform where candidates with disabilities find genuinely matched roles, and employers hire
            against real, enforced accommodation commitments — not just promises.
          </p>
        </div>
      </section>

      {/* Live proof this is real, not a mockup — the actual top scorers
          from the rankings pipeline, right on the front door. */}
      <RankingsHighlights />

      {/* Two products */}
      <section id="rankings" className="border-b border-border bg-muted">
        <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-14 md:grid-cols-2">
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
            href="/ranking"
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
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-semibold tabular-nums text-transparent">
              {openJobsCount}
            </p>
            <p className="text-sm text-muted-foreground">Open roles</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-semibold tabular-nums text-transparent">
              {organizationsCount}
            </p>
            <p className="text-sm text-muted-foreground">Organizations hiring</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-semibold tabular-nums text-transparent">
              {DISABILITY_CATEGORY_OPTIONS.length}
            </p>
            <p className="text-sm text-muted-foreground">Disability categories supported</p>
          </div>
          <div>
            <p className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-semibold tabular-nums text-transparent">
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
            <Link href="/ranking/methodology" className="font-medium text-primary underline">
              the methodology
            </Link>{" "}
            for how it works.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="bg-primary">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center text-primary-foreground">
          <p className="text-xs font-semibold tracking-wide uppercase opacity-80">The mission, in one line</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance">
            Make accessibility enforceable, not just a form field.
          </h2>
          <p className="mt-3 opacity-90">
            Every mechanism on Blackbox either verifies something real, gates on something real, or holds
            someone accountable for something real — on the hiring side and the rankings side alike.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-md bg-background px-6 text-sm font-medium text-foreground hover:opacity-90">
              Job portal →
            </PortalSelectTrigger>
            <Link
              href="/login"
              className="flex h-touch-target items-center justify-center rounded-md border border-primary-foreground px-6 text-sm font-medium hover:bg-primary-foreground/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
