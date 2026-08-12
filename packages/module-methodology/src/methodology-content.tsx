const CATEGORIES = [
  {
    name: "Digital Accessibility",
    description:
      "Whether public-facing websites, apps, and internal tools meet recognized accessibility standards (e.g. WCAG), based on published conformance statements and audit disclosures.",
  },
  {
    name: "Accommodation Policy",
    description:
      "Whether a concrete process exists for employees to request and receive workplace accommodations, and how clearly it's communicated.",
  },
  {
    name: "Inclusive Hiring Practices",
    description:
      "Whether hiring materials and processes explicitly welcome candidates with disabilities, and whether interview accommodations are offered.",
  },
  {
    name: "Physical Accessibility",
    description:
      "Whether offices, campuses, and other facilities meet barrier-free access standards — ramps, accessible restrooms, elevators, and similar infrastructure.",
  },
  {
    name: "Employee Support Programs",
    description:
      "Ongoing programs beyond baseline compliance — employee resource groups, assistive technology provisioning, sensitization training, and similar initiatives.",
  },
];

// Page content only — the shell composes this with <Masthead active="methodology" />.
export function MethodologyContent() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">Methodology</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        <strong>This page describes a placeholder methodology.</strong> The real scoring
        rubric — what each category weighs, how subscores combine into an overall score, and
        what counts as evidence — is still being defined. The categories below are a working
        draft, not a commitment.
      </p>

      <div className="mt-10 space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-serif text-xl font-semibold text-foreground">{cat.name}</h2>
            <p className="mt-2 text-muted-foreground">{cat.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
