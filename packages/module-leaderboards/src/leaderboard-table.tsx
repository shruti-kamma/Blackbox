import Link from "next/link";
import { OrgAvatar } from "./org-avatar";
import { ScoreBadge } from "./score-badge";
import type { MockOrg } from "@blackbox/rankings-data";

export interface LeaderboardTableProps {
  orgs: MockOrg[];
  caption?: string;
}

// Real semantic <table>, not a div grid, so it's announced correctly by
// screen readers (row/column context, header associations). The rounded
// card shell is a wrapper div, not the table itself, so border-radius +
// overflow-hidden don't fight table rendering rules.
export function LeaderboardTable({
  orgs,
  caption = "Organizations ranked by accessibility and inclusion score",
}: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="py-4 pl-6 pr-4 font-medium">
              Rank
            </th>
            <th scope="col" className="py-4 pr-4 font-medium" colSpan={2}>
              Organization
            </th>
            <th scope="col" className="py-4 pr-6 font-medium">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org, index) => (
            <tr key={org.id} className="border-b border-border/70 last:border-b-0">
              <td className="py-4 pl-6 pr-4 align-middle font-serif text-lg text-muted-foreground">
                {index + 1}
              </td>
              <td className="w-12 py-4 pr-3 align-middle">
                <OrgAvatar name={org.name} logoUrl={org.logoUrl} size="sm" />
              </td>
              <td className="py-4 pr-4 align-middle">
                <Link
                  href={`/ranking/organizations/${org.slug}`}
                  className="font-serif text-lg font-semibold text-foreground hover:underline"
                >
                  {org.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {[org.industry, org.location].filter(Boolean).join(" · ") || "Not yet classified"}
                </p>
              </td>
              <td className="py-4 pr-6 align-middle">
                <ScoreBadge score={org.overallScore} verificationLevel={org.verificationLevel} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
