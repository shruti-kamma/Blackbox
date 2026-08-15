import Link from "next/link";
import { getMomentumLeaders, type MockOrg } from "@blackbox/rankings-data";

export interface MomentumLeadersPanelProps {
  orgs: MockOrg[];
}

// Quietly renders nothing if no org in the set has scoreTrend defined —
// real pipeline orgs don't have trend history yet (see mock-orgs.ts),
// so this is an honest gap, not a placeholder shown empty.
export function MomentumLeadersPanel({ orgs }: MomentumLeadersPanelProps) {
  const leaders = getMomentumLeaders(orgs, 5);
  if (leaders.length === 0) return null;

  return (
    <section aria-labelledby="momentum-heading" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 id="momentum-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Momentum leaders
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {leaders.map(({ org, trend, fromScore, toScore }) => (
          <li key={org.id}>
            <Link href={`/rankings/organizations/${org.slug}`} className="block hover:underline">
              <p className="text-sm font-medium text-foreground">{org.name}</p>
            </Link>
            <div className="mt-0.5 flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span>{org.industry ?? "Unclassified"}</span>
              <span className="font-medium text-foreground">
                {trend >= 0 ? "+" : ""}
                {trend.toFixed(1)}
                <span className="ml-1 font-normal text-muted-foreground">
                  ({fromScore} → {toScore})
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
