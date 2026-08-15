import Link from "next/link";
import { redirect } from "next/navigation";
import { MATCH_THRESHOLD } from "@blackbox/matching-engine";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { PortalSelectTrigger } from "@/components/a11y/portal-select-trigger";
import { HeroShapeGrid } from "@/components/hero-shape-grid";

// The Blackbox Jobs landing page — mirrors /indextm's structure (hero,
// live stats, product explainer, feature pillars) so the two products
// read as one site, not two bolted-together halves.
export default async function NexoLanding() {
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

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background/95 to-muted/30 min-h-[calc(100vh-4.25rem)] flex flex-col justify-between py-12 md:py-16">
        <div className="absolute inset-0 z-0 opacity-80">
          <HeroShapeGrid />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8 flex-1 flex flex-col justify-center text-left font-sans">
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
            Blackbox Jobs
          </span>
          <h1 className="mt-4 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground font-sans">
            The hiring platform built for a fair shot.
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground font-sans leading-relaxed">
            Candidates with disabilities build a verified profile, take one accessibility-adjusted assessment, and
            get matched to roles that already fit — no unadapted tests, no guessing whether an employer&rsquo;s
            accommodation promises are real. Employers hire against accommodation commitments that are tracked and
            enforced, not just written down.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Sign up
            </PortalSelectTrigger>
            <Link
              href="/nexo/login"
              className="flex h-touch-target shrink-0 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* First Scroll Reveal Indicator */}
        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-4 flex items-center justify-center">
          <a
            href="#how-it-works"
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

      {/* Real, live stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">{openJobsCount}</p>
            <p className="text-sm text-muted-foreground">Open roles</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">{organizationsCount}</p>
            <p className="text-sm text-muted-foreground">Organizations hiring</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">{DISABILITY_CATEGORY_OPTIONS.length}</p>
            <p className="text-sm text-muted-foreground">Disability categories supported</p>
          </div>
          <div>
            <p className="text-primary text-3xl font-semibold tabular-nums">{MATCH_THRESHOLD}%</p>
            <p className="text-sm text-muted-foreground">Minimum fit to ever appear as a match</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-16 border-b border-border bg-muted py-14 md:py-20">
        <div className="mx-auto w-full max-w-5xl px-4 text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
            How it works
          </h2>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 md:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-lg border-2 border-primary bg-background p-7 text-left">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase">
              For candidates
            </span>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">Get matched, not screened out</h3>
            <ol className="mt-1 flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">1. Build a verified profile</span> — disability
                category, accommodation needs, and assistive technology filtered to what&rsquo;s actually relevant
                to you, not a generic checklist.
              </li>
              <li>
                <span className="font-semibold text-foreground">2. Take one adaptive assessment</span> — a
                self-paced, 40-question exam with three difficulty levels (Easy, Medium, Hard) and language sections
                adjusted to your profile. Score 70%+ to advance a level; no timer, no penalty for stopping where you
                land.
              </li>
              <li>
                <span className="font-semibold text-foreground">3. Get matched to roles that fit</span> — only jobs
                that clear a real fit threshold ever reach you, scored against the accommodations an employer has
                actually committed to.
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border-2 border-border bg-background p-7 text-left">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              For employers
            </span>
            <h3 className="text-2xl font-semibold tracking-tight text-foreground">Hire against real commitments</h3>
            <ol className="mt-1 flex flex-col gap-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">1. Post a role</span> — state the accommodations
                you&rsquo;ll actually provide, not a diversity statement.
              </li>
              <li>
                <span className="font-semibold text-foreground">2. See pre-matched, verified candidates</span> —
                every candidate you see has already cleared the fit threshold against your posting.
              </li>
              <li>
                <span className="font-semibold text-foreground">3. Accommodation history follows you</span> — what
                you actually deliver gets tracked against candidate reviews, feeding the public Blackbox Rankings
                score other candidates and organizations see.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Feature pillars */}
      <section id="features" className="scroll-mt-16 border-t border-border bg-background py-16 md:py-24">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold tracking-wide text-primary uppercase">
              What&rsquo;s actually built
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-sans">
              Not a checkbox platform
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Pillar 1 */}
            <div className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground font-sans">An assessment that adapts to you</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Language sections adjust to your disability category, difficulty rises only as you clear each
                level, and a free retake is available if a profile correction changes what should&rsquo;ve been
                tested. Reaching any level unblocks applying — it&rsquo;s a signal for employers, never a gate on
                you.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 11h14l-1 9H6l-1-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground font-sans">Accommodations that are checked, not assumed</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Optional disability-certificate verification adds a trust badge without ever blocking a candidate
                who hasn&rsquo;t completed the paperwork. Duplicate-account checks and employer accommodation
                history keep the whole system honest on both sides.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col items-start rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground font-sans">Recognition that means something</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                An opt-in leaderboard ranks candidates by assessment level reached, not raw score — since different
                candidates sit different question sets. Nobody appears on it without choosing to.
              </p>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Sign up
            </PortalSelectTrigger>
            <Link
              href="/nexo/login"
              className="flex h-touch-target shrink-0 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
