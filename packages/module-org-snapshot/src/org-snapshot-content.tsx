import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, cn } from "@blackbox/ui";
import { OrgAvatar } from "@blackbox/module-leaderboards";
import { RankSummary } from "./rank-summary";
import { MaturityLadder } from "./maturity-ladder";
import { SnapshotTabs } from "./snapshot-tabs";
import { DimensionScorecard } from "./dimension-scorecard";
import { DimensionRadar } from "./dimension-radar";
import { StrengthsRisks } from "./strengths-risks";
import { ScoreBreakdown } from "./score-breakdown";
import {
  getMaturityLevel,
  getEmployeeFeedbackScore,
  MATURITY_LEVEL_DOT_CLASS,
  VERIFICATION_LEVEL_LABELS,
  getOrg,
  getAllOrgs,
} from "@blackbox/rankings-data";

function StatCard({
  label,
  value,
  sub,
  emphasis = false,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  // Reserved for the one number per page meant to read as the headline
  // stat — see docs/decisions.md ("Editorial redesign"): the gradient duo
  // is deliberately not applied to every numeral, only this one, so it
  // still reads as "the number that matters" rather than decoration.
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-serif font-bold tabular-nums",
          emphasis
            ? "bg-gradient-to-r from-primary to-secondary bg-clip-text text-4xl text-transparent"
            : "text-2xl text-foreground",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// A small tier-colored dot next to the maturity text — same "color
// reinforces the label, text still carries the meaning" pattern as
// ScoreBadge, reused here for the two spots on this page that show the
// maturity level as a standalone value rather than paired with a score.
function MaturityValue({ level }: { level: ReturnType<typeof getMaturityLevel> }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", MATURITY_LEVEL_DOT_CLASS[level])} />
      {level}
    </span>
  );
}

export interface OrgSnapshotContentProps {
  slug: string;
}

export async function OrgSnapshotContent({ slug }: OrgSnapshotContentProps) {
  const [org, allOrgs] = await Promise.all([getOrg(slug), getAllOrgs()]);
  if (!org) notFound();

  const generatedDate = new Date(org.generatedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const maturity = getMaturityLevel(org.overallScore);
  const employeeFeedbackScore = getEmployeeFeedbackScore(org.breakdown);
  const hasTrend = org.scoreTrend !== undefined;
  const trendSign = hasTrend && org.scoreTrend! >= 0 ? "+" : "";
  const hasWorkforceData = org.employees !== undefined && org.employeesWithDisabilities !== undefined;

  const metaParts = [
    org.type === "COMPANY" ? "Company" : "University",
    org.industry ?? "Industry not yet classified",
    org.location ?? "Location not yet classified",
    org.employees !== undefined ? `${org.employees.toLocaleString("en-IN")} employees` : null,
  ].filter(Boolean);

  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        {/* Header */}
        <div className="border-b border-foreground pb-8">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Blackbox Global Foundation &middot; Accessibility Intelligence
          </p>
          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <OrgAvatar name={org.name} logoUrl={org.logoUrl} size="lg" />
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {org.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{metaParts.join(" · ")}</p>
                <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {VERIFICATION_LEVEL_LABELS[org.verificationLevel]}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-3 sm:justify-end">
              <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Blackbox Score</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-serif text-4xl font-bold tabular-nums text-transparent">
                    {org.overallScore}
                  </span>
                  {hasTrend && (
                    <span className="text-xs font-medium text-primary">
                      {trendSign}
                      {org.scoreTrend} / 12mo
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Maturity level
                </p>
                <p className="mt-1 font-serif text-xl font-bold text-foreground">
                  <MaturityValue level={maturity} />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-6">
          <RankSummary org={org} allOrgs={allOrgs} />
        </div>

        <div className="border-b border-border pb-6">
          <MaturityLadder level={maturity} />
        </div>

        <SnapshotTabs />

        {org.verificationLevel === 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Is this your organization?</p>
            <Button
              asChild
              variant="primary"
              size="sm"
              className="rounded-full shrink-0 bg-gradient-to-r from-primary to-secondary"
            >
              <Link href={`/rankings/claim?org=${org.slug}`}>Claim record</Link>
            </Button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Overall Blackbox Score"
            value={org.overallScore}
            sub={hasTrend ? `${trendSign}${org.scoreTrend} / 12mo` : undefined}
            emphasis
          />
          <StatCard label="Maturity Level" value={<MaturityValue level={maturity} />} />
          {employeeFeedbackScore !== undefined && (
            <StatCard label="Employee Experience" value={`${employeeFeedbackScore}/100`} />
          )}
          {org.aiConfidence !== undefined && (
            <StatCard
              label="AI Confidence"
              value={`${org.aiConfidence}%`}
              sub={org.evidenceItemCount !== undefined ? `${org.evidenceItemCount} evidence items` : undefined}
            />
          )}
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-foreground">
          Benchmark profile
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each dimension vs. the national industry average.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[280px_1fr] lg:items-center">
          <DimensionRadar breakdown={org.breakdown} />
          <DimensionScorecard breakdown={org.breakdown} />
        </div>

        <div className="mt-8">
          <StrengthsRisks breakdown={org.breakdown} />
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-foreground">
          Score breakdown
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Methodology {org.methodologyVersion} &middot; generated {generatedDate}
          {hasWorkforceData && (
            <>
              {" "}
              &middot; {org.employeesWithDisabilities!.toLocaleString("en-IN")} of{" "}
              {org.employees!.toLocaleString("en-IN")} employees identified with disabilities (
              {((org.employeesWithDisabilities! / org.employees!) * 100).toFixed(2)}%)
            </>
          )}
        </p>
        <div className="mt-4 rounded-2xl border border-border bg-card px-6 shadow-sm">
          <ScoreBreakdown breakdown={org.breakdown} />
        </div>
    </main>
  );
}
