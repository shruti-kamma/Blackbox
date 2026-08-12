import Link from "next/link";
import { getTopPerformers, type MockOrg } from "@blackbox/rankings-data";

export interface TopPerformersPanelProps {
  orgs: MockOrg[];
}

export function TopPerformersPanel({ orgs }: TopPerformersPanelProps) {
  const top = getTopPerformers(orgs, 5);
  if (top.length === 0) return null;

  return (
    <section
      aria-labelledby="top-performers-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <h2 id="top-performers-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Top performers
      </h2>
      <ol className="mt-3 flex flex-col gap-2">
        {top.map((org, i) => (
          <li key={org.id} className="flex items-baseline justify-between gap-2 text-sm">
            <Link
              href={`/ranking/organizations/${org.slug}`}
              className="flex min-w-0 items-baseline gap-2 text-foreground hover:underline"
            >
              <span className="shrink-0 text-muted-foreground">{i + 1}.</span>
              <span className="truncate">{org.name}</span>
            </Link>
            <span className="shrink-0 font-serif font-semibold tabular-nums text-foreground">
              {org.overallScore}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
