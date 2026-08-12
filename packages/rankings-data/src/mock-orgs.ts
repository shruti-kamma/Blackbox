// Placeholder data for UI/UX iteration only — org names are fictional, and
// its 5 breakdown categories predate the client's finalized 10-metric
// methodology (see docs/decisions.md — "Scoring methodology"). Real data
// (via get-orgs.ts -> @blackbox/db) always uses the real 10 metrics; this
// file is now only a fallback shown when Postgres isn't reachable, so
// rewriting its content to match wasn't prioritized — known inconsistency,
// not an oversight.
// Shaped to match what Prisma actually returns (Organization + latest
// AccessibilityScore + breakdown[]) wherever the two can agree, so
// swapping between them changes only how pages fetch this shape, not the
// pages/components — see get-orgs.ts for the fallback logic itself.

export type OrgType = "COMPANY" | "UNIVERSITY";

export interface ScoreBreakdownItem {
  category: string;
  subscore: number; // 0-100
  industryAverage: number; // 0-100 — for the dimension scorecard's "vs X" comparison
  rationale: string;
  // Absent/undefined (mock data) or null (real data, from Python's JSON
  // null) both mean "none" — components treat them the same way.
  recommendation?: string | null;
}

// Index into VERIFICATION_LEVEL_LABELS. Every org starts at 0 (AI Est.) —
// nothing moves up this ladder until a company claims its record and
// submits/backs up additional data (see docs/decisions.md). The label text
// itself is shown in both public and company views (e.g. "AI Est.",
// "Registered") — only the full 6-step progress-bar visualization
// (VerificationLadder) is company-view-only content.
export const VERIFICATION_LEVEL_LABELS = [
  "AI Est.",
  "Registered",
  "Self-Declared",
  "Doc-Verified",
  "Audited",
  "Certified",
] as const;

export type VerificationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface MockOrg {
  id: string;
  slug: string;
  name: string;
  type: OrgType;
  industry: string | null;
  location: string | null;
  logoUrl: string | null;
  description: string | null;
  overallScore: number; // 0-100
  verificationLevel: VerificationLevel;
  methodologyVersion: string;
  generatedAt: string; // ISO date
  breakdown: ScoreBreakdownItem[];
  // Everything below is presentational-only, shown in the Snapshot layout
  // when present. None of it exists in the real pipeline yet (no
  // numeric-parsing step for headcounts, no historical score runs to
  // diff for a trend, no extraction-confidence computation) — real org
  // data (get-orgs.ts) always omits these, and Snapshot components must
  // render without them rather than assume they're always populated.
  scoreTrend?: number; // change over the past 12 months, e.g. +6.4 or -1.4
  employees?: number;
  employeesWithDisabilities?: number;
  // Extraction-confidence signal, not a verification/trust signal — how
  // confident the pipeline is in what it extracted, independent of how
  // much a company has proven/claimed.
  aiConfidence?: number; // 0-100
  evidenceItemCount?: number;
}

// Employee Experience Index shown in the Snapshot is just the "Employee
// Feedback" metric's own subscore — not a separately stored field. Works
// identically for mock and real data as long as that category exists in
// the breakdown (real data always has it; this mock file's older
// 5-category breakdown doesn't, so mock orgs simply won't show this stat
// — see the file-level comment above on why that's left as-is).
export function getEmployeeFeedbackScore(breakdown: ScoreBreakdownItem[]): number | undefined {
  return breakdown.find((item) => item.category === "Employee Feedback")?.subscore;
}

const CATEGORIES = [
  "Digital Accessibility",
  "Accommodation Policy",
  "Inclusive Hiring Practices",
  "Physical Accessibility",
  "Employee Support Programs",
] as const;

export const MOCK_ORGS: MockOrg[] = [
  {
    id: "org-1",
    slug: "sahyog-financial-services",
    name: "Sahyog Financial Services",
    type: "COMPANY",
    industry: "Financial Services",
    location: "Mumbai, Maharashtra",
    logoUrl: "/vercel.svg",
    description:
      "A mid-size NBFC offering retail lending and insurance products across western India.",
    overallScore: 88,
    scoreTrend: 4.1,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 3200,
    employeesWithDisabilities: 118,
    aiConfidence: 95,
    evidenceItemCount: 58,
    breakdown: [
      { category: CATEGORIES[0], subscore: 91, industryAverage: 76, rationale: "The company's customer portal and mobile app both carry current WCAG 2.1 AA conformance statements, with a published remediation timeline for any known gaps." },
      { category: CATEGORIES[1], subscore: 85, industryAverage: 70, rationale: "Reasonable accommodation requests are routed through a named HR contact with a stated 10-business-day response commitment." },
      { category: CATEGORIES[2], subscore: 84, industryAverage: 68, rationale: "Campus hiring materials explicitly invite applications from persons with disabilities, and interview formats can be adapted on request." },
      { category: CATEGORIES[3], subscore: 90, industryAverage: 73, rationale: "All branch offices opened after 2022 meet barrier-free access standards; older branches are being retrofitted on a published schedule." },
      { category: CATEGORIES[4], subscore: 89, industryAverage: 71, rationale: "An internal employee resource group for disability inclusion meets quarterly and reports directly to the CHRO." },
    ],
  },
  {
    id: "org-2",
    slug: "neelkamal-textiles",
    name: "NeelKamal Textiles",
    type: "COMPANY",
    industry: "Manufacturing",
    location: "Ahmedabad, Gujarat",
    logoUrl: null,
    description: "A textile manufacturer and exporter with three production facilities in Gujarat.",
    overallScore: 42,
    scoreTrend: 1.8,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 5400,
    employeesWithDisabilities: 62,
    aiConfidence: 88,
    evidenceItemCount: 22,
    breakdown: [
      { category: CATEGORIES[0], subscore: 30, industryAverage: 42, rationale: "No accessibility statement found for the company's public-facing website.", recommendation: "Publish a public accessibility statement for the company website, ideally referencing WCAG 2.1 AA conformance, and note a remediation plan for any known gaps." },
      { category: CATEGORIES[1], subscore: 38, industryAverage: 40, rationale: "The filing references a general grievance mechanism but does not describe a specific accommodation process.", recommendation: "Document a dedicated workplace accommodation process — a named contact and a stated response-time commitment — separate from the general grievance mechanism." },
      { category: CATEGORIES[2], subscore: 45, industryAverage: 48, rationale: "Equal-opportunity language is present in hiring policy but no disability-specific outreach is described.", recommendation: "Add disability-specific language to hiring materials and describe how interview accommodations can be requested." },
      { category: CATEGORIES[3], subscore: 55, industryAverage: 50, rationale: "One of three facilities is described as having ramp access; the other two are not addressed.", recommendation: "Publish an accessibility status and retrofit timeline for the two facilities not yet addressed." },
      { category: CATEGORIES[4], subscore: 42, industryAverage: 44, rationale: "No employee support programs specific to disability inclusion were disclosed.", recommendation: "Establish and disclose at least one employee-support initiative for disability inclusion, such as an assistive-technology stipend or a disability-focused ERG." },
    ],
  },
  {
    id: "org-3",
    slug: "brightpath-technologies",
    name: "Brightpath Technologies",
    type: "COMPANY",
    industry: "Software",
    location: "Bengaluru, Karnataka",
    logoUrl: null,
    description: "An enterprise SaaS company building supply-chain software for mid-market manufacturers.",
    overallScore: 76,
    scoreTrend: 3.5,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 850,
    employeesWithDisabilities: 34,
    aiConfidence: 93,
    evidenceItemCount: 41,
    breakdown: [
      { category: CATEGORIES[0], subscore: 80, industryAverage: 68, rationale: "Internal tooling and the customer-facing product both underwent a third-party accessibility audit within the past 12 months." },
      { category: CATEGORIES[1], subscore: 70, industryAverage: 62, rationale: "An accommodation policy exists but the filing does not state a response-time commitment.", recommendation: "State a specific response-time commitment for accommodation requests in the published policy." },
      { category: CATEGORIES[2], subscore: 78, industryAverage: 65, rationale: "Job postings note that accommodations are available during the interview process on request." },
      { category: CATEGORIES[3], subscore: 72, industryAverage: 64, rationale: "The Bengaluru headquarters is described as fully accessible; smaller satellite offices are not addressed.", recommendation: "Disclose accessibility status for satellite offices, or publish a retrofit plan if gaps exist." },
      { category: CATEGORIES[4], subscore: 80, industryAverage: 66, rationale: "Assistive technology stipends are available to employees who need them, per the filing." },
    ],
  },
  {
    id: "org-4",
    slug: "vistaar-retail-group",
    name: "Vistaar Retail Group",
    type: "COMPANY",
    industry: "Retail",
    location: "New Delhi",
    logoUrl: null,
    description: "A department-store chain with locations across northern India.",
    overallScore: 61,
    scoreTrend: 2.2,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 12000,
    employeesWithDisabilities: 210,
    aiConfidence: 90,
    evidenceItemCount: 33,
    breakdown: [
      { category: CATEGORIES[0], subscore: 55, industryAverage: 52, rationale: "The e-commerce site has partial accessibility features but no formal conformance statement.", recommendation: "Complete a formal accessibility audit and publish a WCAG conformance statement for the e-commerce site." },
      { category: CATEGORIES[1], subscore: 58, industryAverage: 50, rationale: "A store-level accommodation process is mentioned briefly without detail.", recommendation: "Expand the store-level accommodation process into a documented policy with a named contact and response timeline." },
      { category: CATEGORIES[2], subscore: 62, industryAverage: 55, rationale: "The filing states a target hiring percentage for persons with disabilities without reporting current attainment.", recommendation: "Report current attainment against the stated hiring target, not just the target itself." },
      { category: CATEGORIES[3], subscore: 68, industryAverage: 58, rationale: "Newer store formats include wheelchair-accessible entrances and fitting rooms; older stores are not addressed.", recommendation: "Publish an accessibility retrofit timeline for older store formats." },
      { category: CATEGORIES[4], subscore: 62, industryAverage: 54, rationale: "Sensitization training is offered to store managers on an ad hoc basis.", recommendation: "Formalize sensitization training into a scheduled, disclosed program rather than an ad hoc offering." },
    ],
  },
  {
    id: "org-5",
    slug: "ganga-pharmaceuticals",
    name: "Ganga Pharmaceuticals",
    type: "COMPANY",
    industry: "Pharmaceuticals",
    location: "Hyderabad, Telangana",
    logoUrl: null,
    description: "A generic-drug manufacturer with domestic and export operations.",
    overallScore: 55,
    scoreTrend: 0.9,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 4200,
    employeesWithDisabilities: 71,
    aiConfidence: 89,
    evidenceItemCount: 27,
    breakdown: [
      { category: CATEGORIES[0], subscore: 40, industryAverage: 48, rationale: "No public statement on website or product-documentation accessibility.", recommendation: "Publish an accessibility statement covering both the company website and product documentation." },
      { category: CATEGORIES[1], subscore: 60, industryAverage: 52, rationale: "A named grievance officer handles accommodation requests alongside other HR matters.", recommendation: "Separate accommodation requests from general grievance handling with a dedicated process and response-time commitment." },
      { category: CATEGORIES[2], subscore: 58, industryAverage: 54, rationale: "The filing references compliance with statutory disability-employment quotas without further detail.", recommendation: "Describe concrete inclusive-hiring practices beyond statutory quota compliance, such as accessible interview formats." },
      { category: CATEGORIES[3], subscore: 65, industryAverage: 60, rationale: "Corporate offices are described as accessible; manufacturing sites are not addressed, likely due to safety zoning.", recommendation: "Clarify accessibility accommodations for manufacturing sites where feasible within safety constraints, even if full retrofits aren't possible." },
      { category: CATEGORIES[4], subscore: 52, industryAverage: 50, rationale: "No dedicated disability-inclusion programs were disclosed beyond statutory compliance.", recommendation: "Introduce at least one disability-inclusion program beyond statutory compliance, such as sensitization training or an ERG." },
    ],
  },
  {
    id: "org-6",
    slug: "coastal-logistics",
    name: "Coastal Logistics Ltd",
    type: "COMPANY",
    industry: "Logistics",
    location: "Chennai, Tamil Nadu",
    logoUrl: null,
    description: "A freight and warehousing operator serving southern Indian ports.",
    overallScore: 34,
    scoreTrend: -1.4,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 6800,
    employeesWithDisabilities: 48,
    aiConfidence: 86,
    evidenceItemCount: 15,
    breakdown: [
      { category: CATEGORIES[0], subscore: 25, industryAverage: 38, rationale: "No accessibility disclosure of any kind was found in the filing.", recommendation: "Start with a basic public accessibility statement for the company website — this is currently entirely undisclosed." },
      { category: CATEGORIES[1], subscore: 30, industryAverage: 35, rationale: "No accommodation process is described.", recommendation: "Document a workplace accommodation process with a named contact, even a minimal one, as a starting point." },
      { category: CATEGORIES[2], subscore: 35, industryAverage: 40, rationale: "Hiring policy language is generic and does not mention disability inclusion specifically.", recommendation: "Add disability-specific language to hiring materials to signal openness to candidates with disabilities." },
      { category: CATEGORIES[3], subscore: 45, industryAverage: 42, rationale: "Warehousing and logistics sites are described as having significant physical-access constraints.", recommendation: "Disclose which physical-access improvements are feasible at warehousing sites, and a timeline for the rest." },
      { category: CATEGORIES[4], subscore: 35, industryAverage: 38, rationale: "No employee support programs for disability inclusion were disclosed.", recommendation: "Introduce and disclose at least one disability-inclusion support program." },
    ],
  },
  {
    id: "org-7",
    slug: "aravalli-institute-of-technology",
    name: "Aravalli Institute of Technology",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Jaipur, Rajasthan",
    logoUrl: null,
    description: "A private engineering and sciences university with roughly 12,000 enrolled students.",
    overallScore: 82,
    scoreTrend: 5.6,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1800,
    employeesWithDisabilities: 79,
    aiConfidence: 96,
    evidenceItemCount: 52,
    breakdown: [
      { category: CATEGORIES[0], subscore: 85, industryAverage: 66, rationale: "The learning management system meets published accessibility standards, with captioned lecture recordings as a default." },
      { category: CATEGORIES[1], subscore: 80, industryAverage: 64, rationale: "A dedicated disability services office coordinates academic accommodations for students and staff." },
      { category: CATEGORIES[2], subscore: 78, industryAverage: 62, rationale: "Faculty and staff hiring materials note that interview accommodations are available on request." },
      { category: CATEGORIES[3], subscore: 84, industryAverage: 68, rationale: "Campus buildings constructed since 2018 are fully barrier-free; a retrofit plan covers the remaining older blocks." },
      { category: CATEGORIES[4], subscore: 83, industryAverage: 65, rationale: "A peer-support network for students with disabilities is funded through the student affairs office." },
    ],
  },
  {
    id: "org-8",
    slug: "sundarbans-university",
    name: "Sundarbans University",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Kolkata, West Bengal",
    logoUrl: null,
    description: "A public university offering undergraduate and postgraduate programs across the humanities and sciences.",
    overallScore: 58,
    scoreTrend: 2.7,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 2600,
    employeesWithDisabilities: 47,
    aiConfidence: 90,
    evidenceItemCount: 24,
    breakdown: [
      { category: CATEGORIES[0], subscore: 45, industryAverage: 66, rationale: "The university website has partial accessibility features; the learning portal is not addressed.", recommendation: "Extend accessibility improvements to the learning portal, not just the public website, and publish a conformance statement." },
      { category: CATEGORIES[1], subscore: 55, industryAverage: 64, rationale: "An accommodation process exists for exams specifically, but is not described for other academic settings.", recommendation: "Extend the accommodation process beyond exams to cover coursework, labs, and other academic settings." },
      { category: CATEGORIES[2], subscore: 60, industryAverage: 62, rationale: "Statutory reservation quotas for persons with disabilities are referenced in admissions and staff hiring.", recommendation: "Describe hiring practices beyond quota compliance, such as accessible interview formats for staff and faculty roles." },
      { category: CATEGORIES[3], subscore: 70, industryAverage: 68, rationale: "Main campus buildings have ramp access; several departmental buildings are described as still pending retrofits.", recommendation: "Publish a retrofit timeline for the departmental buildings still pending accessibility upgrades." },
      { category: CATEGORIES[4], subscore: 60, industryAverage: 65, rationale: "A student disability cell exists but its staffing and funding level are not disclosed.", recommendation: "Disclose staffing and funding levels for the disability cell to demonstrate it's adequately resourced." },
    ],
  },
  {
    id: "org-9",
    slug: "nilgiri-college-of-engineering",
    name: "Nilgiri College of Engineering",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Coimbatore, Tamil Nadu",
    logoUrl: null,
    description: "A private engineering college affiliated with a regional technical university.",
    overallScore: 71,
    scoreTrend: 3.0,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 950,
    employeesWithDisabilities: 31,
    aiConfidence: 91,
    evidenceItemCount: 36,
    breakdown: [
      { category: CATEGORIES[0], subscore: 68, industryAverage: 66, rationale: "Course materials are gradually being converted to an accessible format; no timeline is stated for full coverage.", recommendation: "Publish a completion timeline for converting all course materials to an accessible format." },
      { category: CATEGORIES[1], subscore: 72, industryAverage: 64, rationale: "A designated faculty coordinator handles academic accommodation requests for students with disabilities.", recommendation: "State a response-time commitment for accommodation requests handled by the faculty coordinator." },
      { category: CATEGORIES[2], subscore: 70, industryAverage: 62, rationale: "Staff hiring policy references equal opportunity without disability-specific detail.", recommendation: "Add disability-specific language and outreach to staff hiring materials." },
      { category: CATEGORIES[3], subscore: 78, industryAverage: 68, rationale: "The main academic block and library are wheelchair accessible; hostel accessibility is not addressed." },
      { category: CATEGORIES[4], subscore: 68, industryAverage: 65, rationale: "A student support cell exists, covering disability accommodations alongside general counseling services.", recommendation: "Consider a dedicated disability-support function, or at least disclose staffing specific to disability accommodations within the combined cell." },
    ],
  },
];

export function getOrgBySlug(slug: string): MockOrg | undefined {
  return MOCK_ORGS.find((org) => org.slug === slug);
}

export function getOrgsSortedByScore(): MockOrg[] {
  return [...MOCK_ORGS].sort((a, b) => b.overallScore - a.overallScore);
}

// The client's 5-tier maturity ladder — shown in both public and company
// views (unlike VERIFICATION_LEVEL_LABELS' progress-bar visualization,
// which is company-view only). This is the one band/label system used
// everywhere a score needs a text label; severity is no longer
// color-coded (see ScoreBadge) — the tier text is the only signal now.
export const MATURITY_LEVEL_LABELS = [
  "Emerging",
  "Developing",
  "Progressing",
  "Leading",
  "Transforming",
] as const;

export type MaturityLevel = (typeof MATURITY_LEVEL_LABELS)[number];

// Provisional score cutoffs — the client hasn't given exact thresholds yet.
// Calibrated only to the one known reference point (score 68 -> "Progressing"
// from the client's B4I mockup). Replace once the real cutoffs are confirmed;
// nothing else in the app depends on the exact boundary values.
const MATURITY_THRESHOLDS: { min: number; label: MaturityLevel }[] = [
  { min: 85, label: "Transforming" },
  { min: 70, label: "Leading" },
  { min: 45, label: "Progressing" },
  { min: 25, label: "Developing" },
  { min: 0, label: "Emerging" },
];

export function getMaturityLevel(score: number): MaturityLevel {
  return MATURITY_THRESHOLDS.find((t) => score >= t.min)!.label;
}

// "City, State" -> "State". Falls back to the full string for locations
// without a comma (e.g. "New Delhi", which has no separate state name).
// Returns null for orgs with no location on record — real pipeline data
// has this until a company-metadata classification step exists.
export function parseState(location: string | null): string | null {
  if (!location) return null;
  const parts = location.split(",");
  return parts[parts.length - 1]!.trim();
}

export interface RankInfo {
  rank: number;
  total: number;
}

export interface OrgRanks {
  national: RankInfo;
  industry: RankInfo;
  state: RankInfo;
}

// Rank is always computed within the same OrgType — companies and
// universities are separate rankings (see docs/decisions.md), so a
// university never factors into a company's rank or vice versa.
// `allOrgs` must be the full org set the caller is currently working with
// (mock or real — see get-orgs.ts), so ranks reflect whichever dataset is
// actually live rather than always the fictional mock set. Orgs with a
// null industry/location group together as each other's peers (honest
// given none have real classification yet, rather than being excluded).
export function getOrgRanks(org: MockOrg, allOrgs: MockOrg[]): OrgRanks {
  const sameType = [...allOrgs]
    .filter((o) => o.type === org.type)
    .sort((a, b) => b.overallScore - a.overallScore);
  const sameIndustry = sameType.filter((o) => o.industry === org.industry);
  const orgState = parseState(org.location);
  const sameState = sameType.filter((o) => parseState(o.location) === orgState);

  const rankWithin = (list: MockOrg[]): RankInfo => ({
    rank: list.findIndex((o) => o.id === org.id) + 1,
    total: list.length,
  });

  return {
    national: rankWithin(sameType),
    industry: rankWithin(sameIndustry),
    state: rankWithin(sameState),
  };
}
