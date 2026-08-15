// The finalized 10-metric methodology (see docs/decisions.md — "Scoring
// methodology — 10 metrics"): exactly 10, equally weighted, each worth up
// to 10 points toward the 0–100 composite score. Descriptions match what
// the extraction pipeline actually looks for per metric (see
// METRIC_FIELDS in services/crawler/scripts/extract_pwd_signals.py),
// not looser marketing-style language.
// Three of the ten — see claimGated below — have no BRSR-mandated
// disclosure field and are essentially never public pre-claim (see
// docs/decisions.md — "Claim-gated metrics"). They're still scored, just
// excluded from the composite until an organization claims its record.
const CATEGORIES = [
  {
    name: "Accessibility",
    description:
      "Physical accessibility of workplaces and facilities — ramps, accessible restrooms, barrier-free infrastructure — and digital accessibility of public-facing websites, apps, and internal tools, based on published conformance statements and audit disclosures.",
  },
  {
    name: "Policy",
    description:
      "Whether a written accommodation policy exists, and whether a concrete process is described for employees to request and receive workplace accommodations.",
  },
  {
    name: "Employment",
    description:
      "Overall headcount and proportion of persons with disabilities employed, as publicly disclosed — the workforce-representation baseline the other workforce metrics build on.",
  },
  {
    name: "Recruitment",
    description:
      "Hiring process design and attainment against stated targets — whether interview accommodations are offered and inclusive hiring practices are described, not just headcount outcomes.",
  },
  {
    name: "Retention",
    description:
      "Whether employees with disabilities stay — retention-specific disclosures, kept separate from overall headcount since a company can hire well and still retain poorly, or vice versa.",
    claimGated: true,
  },
  {
    name: "Leadership",
    description:
      "Representation of persons with disabilities specifically in senior and leadership roles, distinct from overall workforce representation.",
    claimGated: true,
  },
  {
    name: "Learning",
    description:
      "Formal training and sensitization programs — for managers, for the broader workforce, or both — as opposed to informal or one-off initiatives.",
  },
  {
    name: "Culture",
    description:
      "Observable workplace practices: employee resource groups, flexible-work arrangements, and stated accommodation response-time commitments.",
  },
  {
    name: "Employee Feedback",
    description:
      "Sentiment and self-reported experience from employees with disabilities. Expected to have low disclosure from public filings alone, honestly — most companies won't have data here until they claim their record and submit direct feedback.",
    claimGated: true,
  },
  {
    name: "Compliance",
    description:
      "Statutory and regulatory adherence: RPwD Act quota attainment, WCAG conformance claims, and completeness of public disclosure reporting itself.",
  },
];

// Page content only — the route file (app/(app)/rankings/methodology/page.tsx)
// renders this directly. Navigation into this page comes from the main
// site nav's "Rankings" dropdown (see components/nav.tsx), not a
// section-local nav bar (that Masthead was removed).
export function MethodologyContent() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Methodology</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Every score is built from exactly <strong className="text-foreground">10 equally-weighted
        metrics</strong>, each worth up to 10 points toward the 0–100 composite score — no single
        dimension can dominate the result. Metrics are derived from companies&rsquo; own public
        disclosures, extracted and scored without company involvement unless a record has been
        claimed and verified.
      </p>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Three metrics — Retention, Leadership, and Employee Feedback — have no equivalent mandated
        public disclosure field, so they&rsquo;re essentially never public before a company
        claims its record. They&rsquo;re still scored whenever something is disclosed, but excluded from
        the composite score until an organization claims its profile and can self-declare that data
        directly, so an unclaimed organization is never marked down for information it had no public
        way to provide.
      </p>

      <div className="mt-10 space-y-4">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-sm text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-serif text-xl font-semibold text-foreground">{cat.name}</h2>
              {cat.claimGated && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                  Counted after claim
                </span>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">{cat.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
