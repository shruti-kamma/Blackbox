import Link from "next/link";
import { getWatchlist, type MockOrg } from "@blackbox/rankings-data";

export interface WatchlistPanelProps {
  orgs: MockOrg[];
}

// "Needs attention" framing in text only — never a red-dot severity
// signal, per the established "severity is not color-coded" rule (see
// ScoreBadge / TierLegend).
export function WatchlistPanel({ orgs }: WatchlistPanelProps) {
  const watchlist = getWatchlist(orgs, 5);
  if (watchlist.length === 0) return null;

  return (
    <section aria-labelledby="watchlist-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 id="watchlist-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Needs attention
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {watchlist.map((org) => (
          <li key={org.id} className="flex items-baseline justify-between gap-2 text-sm">
            <Link href={`/ranking/organizations/${org.slug}`} className="min-w-0 truncate text-foreground hover:underline">
              {org.name}
            </Link>
            <span className="shrink-0 font-serif font-semibold tabular-nums text-muted-foreground">
              {org.overallScore}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
