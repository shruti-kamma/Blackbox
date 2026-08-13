import Link from "next/link";
import { redirect } from "next/navigation";
import { MATCH_THRESHOLD } from "@blackbox/matching-engine";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { PortalSelectTrigger } from "@/components/a11y/portal-select-trigger";

// The original job-portal marketing page — moved here from root `/` so the
// new umbrella "Blackbox" landing page (Jobs + Rankings) can live at root
// instead. Reachable from the umbrella page's "Blackbox Jobs" product card.
export default async function JobsLanding() {
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
      <section className="border-b border-foreground">
        <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide text-primary uppercase">Blackbox Jobs</p>
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground md:text-6xl">
              Hiring, matched on what actually fits.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Blackbox Jobs scores every candidate against every role on disability-category fit, skills,
              education, experience, and location — so candidates only see roles they clear a{" "}
              {MATCH_THRESHOLD}% bar for, and hiring managers only review applicants who already do.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90">
                Find a matched job
              </PortalSelectTrigger>
              <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground hover:bg-muted">
                Post a role
              </PortalSelectTrigger>
              <Link
                href="/login"
                className="flex h-touch-target items-center justify-center px-3 text-sm font-medium text-primary"
              >
                Sign in →
              </Link>
            </div>
          </div>

          {/* Illustrative example match card, styled the same as the real matched-jobs feed */}
          <div className="justify-self-center md:justify-self-end">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Example match
            </p>
            <div
              className="w-full max-w-sm rounded-md border-2 p-4"
              style={{ borderColor: "hsl(112.6 65% 40%)", backgroundColor: "hsl(112.6 70% 45% / 0.08)" }}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-foreground">Frontend Developer</h2>
                <span className="text-sm font-semibold" style={{ color: "hsl(112.6 70% 32%)" }}>
                  92% match
                </span>
              </div>
              <p className="text-sm text-muted-foreground">TechNova Solutions · Software Engineering · Remote</p>
              <dl className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-2">
                  <dt>Skills coverage</dt>
                  <dd className="text-foreground">3 of 3 required skills</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Education</dt>
                  <dd className="text-foreground">Meets required level and field</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Location</dt>
                  <dd className="text-foreground">Remote, open to remote work</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Real, live stats */}
      <section className="border-b border-border bg-muted">
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

      {/* How it works */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">How it works</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">For candidates</h3>
              <ol className="mt-4 flex flex-col gap-5">
                {[
                  ["Build one profile", "Disability categories, education, skills, experience, accommodations you need — filled in once."],
                  ["Get matched automatically", "Every new posting is scored against your profile the moment it goes live. No searching required."],
                  ["Apply with confidence", `You only ever see roles that already clear the ${MATCH_THRESHOLD}% fit threshold.`],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-primary uppercase">For employers</h3>
              <ol className="mt-4 flex flex-col gap-5">
                {[
                  ["Post a role", "Target specific disability categories, or leave it open to all — your call."],
                  ["We do the matching", "Candidates are scored the moment you publish. No manual search or resume pile."],
                  ["Review real fits", "See match scores and the full criteria breakdown before you open a single application."],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility commitment */}
      <section className="border-b border-border bg-muted">
        <div className="mx-auto w-full max-w-5xl px-4 py-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Built around disability categories, not around resumes</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every profile and every posting is scored on real accommodation and category fit, not just
            keyword overlap. Candidates list the accommodations they need; employers list what they offer.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {DISABILITY_CATEGORY_OPTIONS.map((c) => (
              <li
                key={c.value}
                className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
              >
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-primary">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 py-16 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">Ready to get matched?</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="flex h-touch-target items-center justify-center rounded-md bg-background px-6 text-sm font-medium text-foreground hover:opacity-90"
            >
              Create your profile
            </Link>
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
