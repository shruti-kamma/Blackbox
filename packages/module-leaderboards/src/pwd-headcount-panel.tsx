import Link from "next/link";
import { PWD_HEADCOUNTS, type MockOrg } from "@blackbox/rankings-data";

export interface PwdHeadcountPanelProps {
  orgs: MockOrg[];
  limit?: number;
}

// Deliberately a ranked list of the raw numbers, not a proportional bar
// chart: PwD headcounts span 0-2,537 across the batch, several companies
// report a genuine and meaningful zero (a bar chart's baseline can't
// represent a bar-vs-no-bar distinction as legibly as a plain "0" in a
// number column), and total workforce size wasn't reliably available
// across all 50 filings to normalize into a fair rate — see
// generated/pwd-insights.ts's own comment. A ranked list with the real
// number is the honest form here, not a chart forced onto data that
// doesn't fit one (see dataviz skill — "sometimes the answer is not a
// chart").
export function PwdHeadcountPanel({ orgs, limit = 5 }: PwdHeadcountPanelProps) {
  const bySlug = new Map(orgs.map((o) => [o.name, o.slug]));
  const disclosed = PWD_HEADCOUNTS.filter((h): h is typeof h & { pwdEmployees: number } => h.pwdEmployees !== null);
  if (disclosed.length === 0) return null;

  const ranked = [...disclosed].sort((a, b) => b.pwdEmployees - a.pwdEmployees).slice(0, limit);
  const zeroCount = disclosed.filter((h) => h.pwdEmployees === 0).length;

  return (
    <section
      aria-labelledby="pwd-headcount-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="pwd-headcount-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Highest disclosed PwD headcount
      </h2>
      <ol className="mt-3 flex flex-col gap-2 text-sm">
        {ranked.map((h, i) => {
          const slug = bySlug.get(h.companyName);
          const nameEl = slug ? (
            <Link href={`/indextm/organizations/${slug}`} className="hover:underline">
              {h.companyName}
            </Link>
          ) : (
            h.companyName
          );
          return (
            <li key={h.symbol} className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate text-foreground">
                <span className="mr-1.5 text-muted-foreground">{i + 1}.</span>
                {nameEl}
              </span>
              <span className="shrink-0 tabular-nums font-medium text-foreground">{h.pwdEmployees.toLocaleString("en-IN")}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[0.7rem] text-muted-foreground">
        Absolute counts, not adjusted for company size — {zeroCount} of {disclosed.length} companies with a reconciled
        figure report zero.
      </p>
    </section>
  );
}
