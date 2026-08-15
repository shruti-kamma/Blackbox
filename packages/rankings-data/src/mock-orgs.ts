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
  {
    id: "org-10",
    slug: "vertex-cloud-systems",
    name: "Vertex Cloud Systems",
    type: "COMPANY",
    industry: "Software",
    location: "Bengaluru, Karnataka",
    logoUrl: null,
    description: "An enterprise cloud infrastructure and DevOps tooling company.",
    overallScore: 82,
    scoreTrend: 5.2,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1900,
    employeesWithDisabilities: 71,
    aiConfidence: 94,
    evidenceItemCount: 47,
    breakdown: [
      { category: CATEGORIES[0], subscore: 86, industryAverage: 70, rationale: "Product and internal engineering tools both carry current WCAG 2.1 AA conformance statements, refreshed each release cycle." },
      { category: CATEGORIES[1], subscore: 80, industryAverage: 64, rationale: "A published accommodation policy names a dedicated People Ops contact with a 5-business-day response commitment." },
      { category: CATEGORIES[2], subscore: 78, industryAverage: 62, rationale: "Engineering job postings explicitly note accessible interview formats and assistive-technology support during onboarding." },
      { category: CATEGORIES[3], subscore: 84, industryAverage: 66, rationale: "The Bengaluru campus meets barrier-free access standards across all three buildings, completed in the last renovation cycle." },
      { category: CATEGORIES[4], subscore: 82, industryAverage: 63, rationale: "An employee resource group for disability inclusion runs monthly and has a standing budget line." },
    ],
  },
  {
    id: "org-11",
    slug: "suryoday-capital-partners",
    name: "Suryoday Capital Partners",
    type: "COMPANY",
    industry: "Financial Services",
    location: "Mumbai, Maharashtra",
    logoUrl: null,
    description: "An investment advisory and wealth management firm serving retail and institutional clients.",
    overallScore: 58,
    scoreTrend: 1.4,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 2100,
    employeesWithDisabilities: 39,
    aiConfidence: 90,
    evidenceItemCount: 26,
    breakdown: [
      { category: CATEGORIES[0], subscore: 50, industryAverage: 55, rationale: "The client portal has partial accessibility features; the mobile app is not addressed in the filing.", recommendation: "Extend the same accessibility work already done on the web portal to the mobile app." },
      { category: CATEGORIES[1], subscore: 55, industryAverage: 52, rationale: "An accommodation process is described in general terms without a stated response timeline.", recommendation: "Publish a specific response-time commitment alongside the existing accommodation process description." },
      { category: CATEGORIES[2], subscore: 60, industryAverage: 50, rationale: "Hiring materials mention equal opportunity without disability-specific outreach language." },
      { category: CATEGORIES[3], subscore: 66, industryAverage: 58, rationale: "The head office is fully accessible; two of four branch offices are not yet addressed.", recommendation: "Publish a retrofit timeline for the two branch offices not yet addressed." },
      { category: CATEGORIES[4], subscore: 59, industryAverage: 54, rationale: "An assistive-technology stipend is available on request, though not proactively advertised." },
    ],
  },
  {
    id: "org-12",
    slug: "anveshan-auto-components",
    name: "Anveshan Auto Components",
    type: "COMPANY",
    industry: "Manufacturing",
    location: "Pune, Maharashtra",
    logoUrl: null,
    description: "A tier-1 auto-parts manufacturer supplying domestic and export OEMs.",
    overallScore: 31,
    scoreTrend: -0.6,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 4600,
    employeesWithDisabilities: 41,
    aiConfidence: 85,
    evidenceItemCount: 12,
    breakdown: [
      { category: CATEGORIES[0], subscore: 20, industryAverage: 40, rationale: "No accessibility disclosure was found for either the corporate website or any internal system.", recommendation: "Publish a basic accessibility statement for the corporate website as a starting point." },
      { category: CATEGORIES[1], subscore: 28, industryAverage: 38, rationale: "No dedicated accommodation process is described in the filing.", recommendation: "Document a workplace accommodation process, even a minimal one, with a named point of contact." },
      { category: CATEGORIES[2], subscore: 34, industryAverage: 42, rationale: "Hiring language references statutory quota compliance without further detail." },
      { category: CATEGORIES[3], subscore: 42, industryAverage: 44, rationale: "Plant floors are described as having significant physical-access constraints, attributed to safety zoning.", recommendation: "Clarify which physical-access improvements are feasible in non-production areas even where the shop floor itself can't be retrofitted." },
      { category: CATEGORIES[4], subscore: 33, industryAverage: 40, rationale: "No disability-inclusion programs beyond statutory compliance were disclosed." },
    ],
  },
  {
    id: "org-13",
    slug: "vaidya-life-sciences",
    name: "Vaidya Life Sciences",
    type: "COMPANY",
    industry: "Pharmaceuticals",
    location: "Hyderabad, Telangana",
    logoUrl: null,
    description: "A research-driven pharmaceutical company focused on generics and biosimilars.",
    overallScore: 68,
    scoreTrend: 3.9,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 3300,
    employeesWithDisabilities: 58,
    aiConfidence: 91,
    evidenceItemCount: 33,
    breakdown: [
      { category: CATEGORIES[0], subscore: 62, industryAverage: 50, rationale: "The investor and careers portions of the website meet published accessibility standards; the R&D intranet is not addressed." },
      { category: CATEGORIES[1], subscore: 68, industryAverage: 54, rationale: "A documented accommodation process routes through occupational health with a stated 7-day response window." },
      { category: CATEGORIES[2], subscore: 70, industryAverage: 52, rationale: "Campus hiring materials explicitly welcome candidates with disabilities and note adaptable interview formats." },
      { category: CATEGORIES[3], subscore: 72, industryAverage: 56, rationale: "Corporate offices and QA labs are fully accessible; manufacturing-floor access is addressed separately due to cleanroom protocols." },
      { category: CATEGORIES[4], subscore: 69, industryAverage: 53, rationale: "A sensitization training module is mandatory for all people managers, refreshed annually." },
    ],
  },
  {
    id: "org-14",
    slug: "kirana-bazaar-retail",
    name: "Kirana Bazaar Retail",
    type: "COMPANY",
    industry: "Retail",
    location: "Bengaluru, Karnataka",
    logoUrl: null,
    description: "A grocery and daily-essentials retail chain with stores across southern India.",
    overallScore: 28,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 8200,
    employeesWithDisabilities: 64,
    aiConfidence: 87,
    evidenceItemCount: 9,
    breakdown: [
      { category: CATEGORIES[0], subscore: 18, industryAverage: 46, rationale: "The e-commerce ordering app has no accessibility disclosure at all.", recommendation: "Start with a basic accessibility audit of the ordering app, the primary digital touchpoint for most customers." },
      { category: CATEGORIES[1], subscore: 26, industryAverage: 44, rationale: "No accommodation process specific to store or warehouse staff is described." },
      { category: CATEGORIES[2], subscore: 32, industryAverage: 46, rationale: "Hiring policy is generic and does not reference disability inclusion." },
      { category: CATEGORIES[3], subscore: 40, industryAverage: 48, rationale: "A minority of newer stores have wheelchair-accessible entrances; most locations are not addressed.", recommendation: "Prioritize accessibility retrofits for the highest-footfall stores first, with a published timeline." },
      { category: CATEGORIES[4], subscore: 24, industryAverage: 40, rationale: "No employee support programs for disability inclusion were disclosed." },
    ],
  },
  {
    id: "org-15",
    slug: "sanchaya-consumer-products",
    name: "Sanchaya Consumer Products",
    type: "COMPANY",
    industry: "FMCG",
    location: "Gurugram, Haryana",
    logoUrl: null,
    description: "A fast-moving consumer goods company manufacturing household and personal-care products.",
    overallScore: 52,
    scoreTrend: 2.1,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 5100,
    employeesWithDisabilities: 76,
    aiConfidence: 88,
    evidenceItemCount: 21,
    breakdown: [
      { category: CATEGORIES[0], subscore: 46, industryAverage: 48, rationale: "The consumer-facing website has partial accessibility features; no formal conformance statement is published." },
      { category: CATEGORIES[1], subscore: 52, industryAverage: 46, rationale: "An accommodation process exists at the corporate office but is not described for plant locations." },
      { category: CATEGORIES[2], subscore: 54, industryAverage: 48, rationale: "Graduate hiring materials note accommodations are available on request during assessments." },
      { category: CATEGORIES[3], subscore: 58, industryAverage: 50, rationale: "The head office is accessible; three regional plants are not addressed in the filing." },
      { category: CATEGORIES[4], subscore: 50, industryAverage: 47, rationale: "A wellness program exists but does not specifically address disability inclusion." },
    ],
  },
  {
    id: "org-16",
    slug: "velocity-motors-india",
    name: "Velocity Motors India",
    type: "COMPANY",
    industry: "Automotive",
    location: "Chennai, Tamil Nadu",
    logoUrl: null,
    description: "A passenger-vehicle manufacturer with domestic and export production lines.",
    overallScore: 45,
    scoreTrend: -1.2,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 9400,
    employeesWithDisabilities: 88,
    aiConfidence: 89,
    evidenceItemCount: 17,
    breakdown: [
      { category: CATEGORIES[0], subscore: 38, industryAverage: 44, rationale: "The dealer-locator and service-booking tools are not addressed in any accessibility disclosure.", recommendation: "Extend the corporate website's accessibility work to the dealer-facing and customer-facing digital tools." },
      { category: CATEGORIES[1], subscore: 44, industryAverage: 42, rationale: "A general grievance mechanism exists but no accommodation-specific process is described." },
      { category: CATEGORIES[2], subscore: 46, industryAverage: 45, rationale: "Equal-opportunity language appears in hiring policy without disability-specific detail." },
      { category: CATEGORIES[3], subscore: 52, industryAverage: 48, rationale: "Corporate offices are accessible; assembly-line areas are addressed separately citing safety constraints." },
      { category: CATEGORIES[4], subscore: 45, industryAverage: 43, rationale: "No disability-inclusion programs beyond statutory quota compliance were disclosed." },
    ],
  },
  {
    id: "org-17",
    slug: "setu-telecom",
    name: "Setu Telecom",
    type: "COMPANY",
    industry: "Telecommunications",
    location: "New Delhi",
    logoUrl: null,
    description: "A pan-India telecom operator offering mobile, broadband, and enterprise connectivity.",
    overallScore: 74,
    scoreTrend: 4.6,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 12500,
    employeesWithDisabilities: 231,
    aiConfidence: 93,
    evidenceItemCount: 44,
    breakdown: [
      { category: CATEGORIES[0], subscore: 78, industryAverage: 60, rationale: "The self-service app and billing portal both carry current WCAG 2.1 AA conformance statements." },
      { category: CATEGORIES[1], subscore: 72, industryAverage: 58, rationale: "A named accommodations team handles requests with a published 10-business-day response commitment." },
      { category: CATEGORIES[2], subscore: 74, industryAverage: 56, rationale: "Call-center and retail hiring explicitly note accessible interview formats and assistive-technology provisioning." },
      { category: CATEGORIES[3], subscore: 70, industryAverage: 54, rationale: "Flagship retail stores meet barrier-free access standards; smaller franchise outlets are not addressed." },
      { category: CATEGORIES[4], subscore: 76, industryAverage: 57, rationale: "An employee resource group for disability inclusion has chapters in four major cities." },
    ],
  },
  {
    id: "org-18",
    slug: "urja-renewables",
    name: "Urja Renewables",
    type: "COMPANY",
    industry: "Energy",
    location: "Ahmedabad, Gujarat",
    logoUrl: null,
    description: "A solar and wind power generation company with utility-scale projects across western India.",
    overallScore: 61,
    scoreTrend: 3.3,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1450,
    employeesWithDisabilities: 22,
    aiConfidence: 86,
    evidenceItemCount: 19,
    breakdown: [
      { category: CATEGORIES[0], subscore: 56, industryAverage: 46, rationale: "The corporate website meets published accessibility standards; project-monitoring dashboards are not addressed." },
      { category: CATEGORIES[1], subscore: 60, industryAverage: 44, rationale: "An accommodation process exists for corporate staff; field/site-operations roles are not addressed." },
      { category: CATEGORIES[2], subscore: 62, industryAverage: 45, rationale: "Hiring materials note interview accommodations are available for corporate roles on request." },
      { category: CATEGORIES[3], subscore: 66, industryAverage: 48, rationale: "The Ahmedabad office is fully accessible; remote generation sites are addressed separately citing terrain constraints." },
      { category: CATEGORIES[4], subscore: 61, industryAverage: 45, rationale: "An assistive-technology stipend is available and proactively communicated during onboarding." },
    ],
  },
  {
    id: "org-19",
    slug: "pathway-logistics",
    name: "Pathway Logistics Ltd",
    type: "COMPANY",
    industry: "Logistics",
    location: "Kolkata, West Bengal",
    logoUrl: null,
    description: "A freight, warehousing, and last-mile delivery operator serving eastern India.",
    overallScore: 22,
    scoreTrend: -2.4,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 6700,
    employeesWithDisabilities: 34,
    aiConfidence: 84,
    evidenceItemCount: 6,
    breakdown: [
      { category: CATEGORIES[0], subscore: 14, industryAverage: 38, rationale: "No accessibility disclosure of any kind was found in the filing.", recommendation: "Publish a basic public accessibility statement for the company website as a first, low-cost step." },
      { category: CATEGORIES[1], subscore: 20, industryAverage: 35, rationale: "No accommodation process is described anywhere in the filing.", recommendation: "Document a minimal workplace accommodation process with a named contact." },
      { category: CATEGORIES[2], subscore: 24, industryAverage: 40, rationale: "Hiring policy language is generic and does not mention disability inclusion." },
      { category: CATEGORIES[3], subscore: 34, industryAverage: 42, rationale: "Warehousing and sorting-hub sites are described as having significant physical-access constraints.", recommendation: "Disclose which physical-access improvements are feasible at warehousing sites, even partial ones." },
      { category: CATEGORIES[4], subscore: 18, industryAverage: 38, rationale: "No employee support programs for disability inclusion were disclosed." },
    ],
  },
  {
    id: "org-20",
    slug: "nirmaan-realty-group",
    name: "Nirmaan Realty Group",
    type: "COMPANY",
    industry: "Real Estate",
    location: "Gurugram, Haryana",
    logoUrl: null,
    description: "A residential and commercial real-estate developer active across the NCR region.",
    overallScore: 48,
    scoreTrend: 1.8,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1120,
    employeesWithDisabilities: 14,
    aiConfidence: 85,
    evidenceItemCount: 15,
    breakdown: [
      { category: CATEGORIES[0], subscore: 40, industryAverage: 42, rationale: "The property-listing website has partial accessibility features; no conformance statement is published." },
      { category: CATEGORIES[1], subscore: 47, industryAverage: 40, rationale: "An accommodation process is referenced briefly without a stated response timeline." },
      { category: CATEGORIES[2], subscore: 50, industryAverage: 44, rationale: "Hiring materials reference equal opportunity without disability-specific detail." },
      { category: CATEGORIES[3], subscore: 58, industryAverage: 46, rationale: "New residential and commercial developments include barrier-free access by design; the corporate office itself predates this standard." },
      { category: CATEGORIES[4], subscore: 45, industryAverage: 41, rationale: "No disability-inclusion programs beyond standard HR policy were disclosed." },
    ],
  },
  {
    id: "org-21",
    slug: "kathaa-media-network",
    name: "Kathaa Media Network",
    type: "COMPANY",
    industry: "Media & Entertainment",
    location: "Mumbai, Maharashtra",
    logoUrl: null,
    description: "A television, streaming, and digital content network producing regional and national programming.",
    overallScore: 66,
    scoreTrend: 2.9,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 3800,
    employeesWithDisabilities: 61,
    aiConfidence: 90,
    evidenceItemCount: 29,
    breakdown: [
      { category: CATEGORIES[0], subscore: 64, industryAverage: 50, rationale: "The streaming platform publishes closed-captioning coverage figures and a WCAG 2.1 AA conformance statement for its web player." },
      { category: CATEGORIES[1], subscore: 62, industryAverage: 48, rationale: "A documented accommodation process exists with a named HR contact for production and corporate staff alike." },
      { category: CATEGORIES[2], subscore: 68, industryAverage: 50, rationale: "On-air and production hiring explicitly welcomes applications from candidates with disabilities." },
      { category: CATEGORIES[3], subscore: 65, industryAverage: 49, rationale: "Studio and corporate office locations meet barrier-free access standards; smaller regional bureaus are not addressed." },
      { category: CATEGORIES[4], subscore: 70, industryAverage: 52, rationale: "A closed-captioning and audio-description initiative for original content is disclosed as an active program, not just a policy." },
    ],
  },
  {
    id: "org-22",
    slug: "rajputana-hospitality-group",
    name: "Rajputana Hospitality Group",
    type: "COMPANY",
    industry: "Hospitality",
    location: "Jaipur, Rajasthan",
    logoUrl: null,
    description: "A heritage and business hotel operator with properties across Rajasthan and Delhi NCR.",
    overallScore: 55,
    scoreTrend: 2.5,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 2600,
    employeesWithDisabilities: 33,
    aiConfidence: 87,
    evidenceItemCount: 18,
    breakdown: [
      { category: CATEGORIES[0], subscore: 48, industryAverage: 44, rationale: "The booking website has partial accessibility features; no formal audit or conformance statement is published." },
      { category: CATEGORIES[1], subscore: 54, industryAverage: 42, rationale: "An accommodation process exists for corporate staff; property-level staff are not explicitly addressed." },
      { category: CATEGORIES[2], subscore: 56, industryAverage: 45, rationale: "Hiring materials note accommodations are available during interviews on request." },
      { category: CATEGORIES[3], subscore: 64, industryAverage: 48, rationale: "Newer properties include accessible rooms and barrier-free common areas; heritage properties are addressed separately citing preservation constraints." },
      { category: CATEGORIES[4], subscore: 53, industryAverage: 43, rationale: "Guest-facing accessibility features are disclosed at some properties; staff-facing support programs are not described." },
    ],
  },
  {
    id: "org-23",
    slug: "nexora-technologies",
    name: "Nexora Technologies",
    type: "COMPANY",
    industry: "Software",
    location: "Hyderabad, Telangana",
    logoUrl: null,
    description: "A product engineering company building B2B SaaS tools for supply-chain and logistics operators.",
    overallScore: 91,
    scoreTrend: 6.1,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1250,
    employeesWithDisabilities: 58,
    aiConfidence: 97,
    evidenceItemCount: 63,
    breakdown: [
      { category: CATEGORIES[0], subscore: 94, industryAverage: 68, rationale: "Product, marketing site, and internal tools all underwent a third-party accessibility audit within the past six months, with published remediation status." },
      { category: CATEGORIES[1], subscore: 90, industryAverage: 62, rationale: "A dedicated accommodations lead sits within People Ops with a 3-business-day response commitment, tracked and reported quarterly." },
      { category: CATEGORIES[2], subscore: 88, industryAverage: 63, rationale: "Every job posting includes accessible-interview-format language by default, not as an opt-in note." },
      { category: CATEGORIES[3], subscore: 92, industryAverage: 65, rationale: "The single Hyderabad campus is fully barrier-free, built to that standard from initial construction." },
      { category: CATEGORIES[4], subscore: 91, industryAverage: 64, rationale: "Assistive technology, ERG funding, and flexible-hours policies are all disclosed as standing, budgeted programs rather than case-by-case accommodations." },
    ],
  },
  {
    id: "org-24",
    slug: "dakshin-bank",
    name: "Dakshin Bank Ltd",
    type: "COMPANY",
    industry: "Financial Services",
    location: "Chennai, Tamil Nadu",
    logoUrl: null,
    description: "A regional private-sector bank serving retail and small-business customers in southern India.",
    overallScore: 35,
    scoreTrend: -0.8,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 3900,
    employeesWithDisabilities: 41,
    aiConfidence: 88,
    evidenceItemCount: 11,
    breakdown: [
      { category: CATEGORIES[0], subscore: 28, industryAverage: 55, rationale: "Net-banking and mobile-app accessibility are not addressed in the filing.", recommendation: "Commission a basic accessibility audit of the net-banking and mobile-app platforms, the primary digital touchpoints for most customers." },
      { category: CATEGORIES[1], subscore: 34, industryAverage: 52, rationale: "A general grievance channel exists but no accommodation-specific process is described." },
      { category: CATEGORIES[2], subscore: 36, industryAverage: 50, rationale: "Hiring policy references statutory quota compliance without further detail." },
      { category: CATEGORIES[3], subscore: 44, industryAverage: 58, rationale: "A minority of branches have ramp access; most are not addressed in the filing.", recommendation: "Publish a branch-by-branch accessibility retrofit timeline, starting with highest-footfall locations." },
      { category: CATEGORIES[4], subscore: 32, industryAverage: 54, rationale: "No disability-inclusion programs beyond statutory compliance were disclosed." },
    ],
  },
  {
    id: "org-25",
    slug: "ilanji-precision-engineering",
    name: "Ilanji Precision Engineering",
    type: "COMPANY",
    industry: "Manufacturing",
    location: "Coimbatore, Tamil Nadu",
    logoUrl: null,
    description: "A precision-components manufacturer serving industrial machinery and aerospace clients.",
    overallScore: 44,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1680,
    employeesWithDisabilities: 19,
    aiConfidence: 86,
    evidenceItemCount: 14,
    breakdown: [
      { category: CATEGORIES[0], subscore: 34, industryAverage: 42, rationale: "No accessibility statement was found for the company's public-facing website.", recommendation: "Publish a basic accessibility statement referencing WCAG 2.1 AA as a starting point." },
      { category: CATEGORIES[1], subscore: 42, industryAverage: 40, rationale: "The filing references a general HR grievance channel without a specific accommodation process." },
      { category: CATEGORIES[2], subscore: 45, industryAverage: 43, rationale: "Equal-opportunity language appears in hiring policy without disability-specific outreach." },
      { category: CATEGORIES[3], subscore: 54, industryAverage: 45, rationale: "The engineering office is accessible; the machining floor is addressed separately citing safety constraints." },
      { category: CATEGORIES[4], subscore: 42, industryAverage: 41, rationale: "No employee support programs specific to disability inclusion were disclosed." },
    ],
  },
  {
    id: "org-26",
    slug: "charak-biotech",
    name: "Charak Biotech",
    type: "COMPANY",
    industry: "Pharmaceuticals",
    location: "Ahmedabad, Gujarat",
    logoUrl: null,
    description: "A biotechnology company developing generic injectable and biosimilar therapies.",
    overallScore: 26,
    scoreTrend: -3.1,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 2200,
    employeesWithDisabilities: 18,
    aiConfidence: 83,
    evidenceItemCount: 8,
    breakdown: [
      { category: CATEGORIES[0], subscore: 16, industryAverage: 50, rationale: "No accessibility disclosure of any kind was found in the filing.", recommendation: "Publish a basic public accessibility statement for the corporate website, currently entirely undisclosed." },
      { category: CATEGORIES[1], subscore: 22, industryAverage: 54, rationale: "No accommodation process is described anywhere in the filing.", recommendation: "Document a minimal workplace accommodation process with a named point of contact as a first step." },
      { category: CATEGORIES[2], subscore: 28, industryAverage: 52, rationale: "Hiring policy language does not reference disability inclusion in any form." },
      { category: CATEGORIES[3], subscore: 38, industryAverage: 56, rationale: "Lab and cleanroom access constraints are cited without any disclosure of what accommodations, if any, are feasible.", recommendation: "Disclose what physical-access accommodations are feasible in non-cleanroom administrative areas." },
      { category: CATEGORIES[4], subscore: 20, industryAverage: 53, rationale: "No disability-inclusion programs of any kind were disclosed." },
    ],
  },
  {
    id: "org-27",
    slug: "punjab-green-power",
    name: "Punjab Green Power",
    type: "COMPANY",
    industry: "Energy",
    location: "Chandigarh, Punjab",
    logoUrl: null,
    description: "A biomass and small-hydro power generation company operating across Punjab and Haryana.",
    overallScore: 59,
    scoreTrend: 2.2,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 890,
    employeesWithDisabilities: 11,
    aiConfidence: 84,
    evidenceItemCount: 13,
    breakdown: [
      { category: CATEGORIES[0], subscore: 52, industryAverage: 46, rationale: "The corporate website has partial accessibility features; no formal conformance statement is published." },
      { category: CATEGORIES[1], subscore: 58, industryAverage: 44, rationale: "An accommodation process exists for head-office staff; plant-level staff are not addressed." },
      { category: CATEGORIES[2], subscore: 60, industryAverage: 45, rationale: "Hiring materials note interview accommodations are available for corporate roles." },
      { category: CATEGORIES[3], subscore: 64, industryAverage: 48, rationale: "The Chandigarh office is fully accessible; generation-plant sites are addressed separately citing terrain and safety constraints." },
      { category: CATEGORIES[4], subscore: 61, industryAverage: 46, rationale: "An assistive-technology stipend is disclosed as available, though not proactively advertised during onboarding." },
    ],
  },
  {
    id: "org-28",
    slug: "vellore-institute-of-advanced-studies",
    name: "Vellore Institute of Advanced Studies",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Chennai, Tamil Nadu",
    logoUrl: null,
    description: "A private research university offering engineering, sciences, and management programs.",
    overallScore: 78,
    scoreTrend: 4.4,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 2400,
    employeesWithDisabilities: 96,
    aiConfidence: 95,
    evidenceItemCount: 48,
    breakdown: [
      { category: CATEGORIES[0], subscore: 80, industryAverage: 66, rationale: "The learning management system meets published accessibility standards, with captioned lectures available by default." },
      { category: CATEGORIES[1], subscore: 76, industryAverage: 64, rationale: "A dedicated disability services office coordinates academic accommodations with a published turnaround commitment." },
      { category: CATEGORIES[2], subscore: 74, industryAverage: 62, rationale: "Faculty and staff hiring materials note interview accommodations are available on request." },
      { category: CATEGORIES[3], subscore: 82, industryAverage: 68, rationale: "Campus buildings constructed in the last decade are fully barrier-free; a retrofit plan covers the remaining older blocks." },
      { category: CATEGORIES[4], subscore: 78, industryAverage: 65, rationale: "A peer-mentorship network for students with disabilities is funded through the student affairs office." },
    ],
  },
  {
    id: "org-29",
    slug: "deccan-university-of-technology",
    name: "Deccan University of Technology",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Pune, Maharashtra",
    logoUrl: null,
    description: "A public technical university offering undergraduate and postgraduate engineering programs.",
    overallScore: 53,
    scoreTrend: 1.6,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1850,
    employeesWithDisabilities: 34,
    aiConfidence: 89,
    evidenceItemCount: 22,
    breakdown: [
      { category: CATEGORIES[0], subscore: 44, industryAverage: 66, rationale: "The main website has partial accessibility features; the student learning portal is not addressed.", recommendation: "Extend accessibility work to the learning portal, not just the public website." },
      { category: CATEGORIES[1], subscore: 52, industryAverage: 64, rationale: "An accommodation process exists for examinations specifically, but is not described for coursework or labs." },
      { category: CATEGORIES[2], subscore: 55, industryAverage: 62, rationale: "Statutory reservation quotas are referenced in admissions and staff hiring without further detail." },
      { category: CATEGORIES[3], subscore: 62, industryAverage: 68, rationale: "Main academic buildings have ramp access; several departmental blocks are described as pending retrofits." },
      { category: CATEGORIES[4], subscore: 54, industryAverage: 65, rationale: "A student disability cell exists but its staffing and funding level are not disclosed.", recommendation: "Disclose staffing and funding levels for the disability cell to demonstrate it's adequately resourced." },
    ],
  },
  {
    id: "org-30",
    slug: "awadh-state-university",
    name: "Awadh State University",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Lucknow, Uttar Pradesh",
    logoUrl: null,
    description: "A public university offering undergraduate and postgraduate programs across the humanities and sciences.",
    overallScore: 24,
    scoreTrend: -1.9,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 3100,
    employeesWithDisabilities: 28,
    aiConfidence: 82,
    evidenceItemCount: 7,
    breakdown: [
      { category: CATEGORIES[0], subscore: 16, industryAverage: 66, rationale: "No accessibility disclosure of any kind was found for the university website or learning systems.", recommendation: "Publish a basic accessibility statement for the university website as a first step." },
      { category: CATEGORIES[1], subscore: 22, industryAverage: 64, rationale: "No accommodation process is described anywhere in the filing.", recommendation: "Document a minimal academic accommodation process with a named point of contact." },
      { category: CATEGORIES[2], subscore: 26, industryAverage: 62, rationale: "Statutory reservation quotas are referenced without any description of hiring or admissions practice beyond compliance." },
      { category: CATEGORIES[3], subscore: 36, industryAverage: 68, rationale: "Physical-access constraints across most campus buildings are acknowledged without a stated retrofit plan.", recommendation: "Publish even a partial, phased retrofit timeline for the most-used academic buildings." },
      { category: CATEGORIES[4], subscore: 20, industryAverage: 65, rationale: "No disability-support programs or cell of any kind were disclosed." },
    ],
  },
  {
    id: "org-31",
    slug: "kerala-institute-of-sciences",
    name: "Kerala Institute of Sciences",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Thiruvananthapuram, Kerala",
    logoUrl: null,
    description: "A public research institute specializing in the natural and applied sciences.",
    overallScore: 85,
    scoreTrend: 3.7,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    employees: 1400,
    employeesWithDisabilities: 62,
    aiConfidence: 96,
    evidenceItemCount: 55,
    breakdown: [
      { category: CATEGORIES[0], subscore: 88, industryAverage: 66, rationale: "The institute's learning management system and research portal both underwent a third-party accessibility audit within the past year." },
      { category: CATEGORIES[1], subscore: 84, industryAverage: 64, rationale: "A dedicated disability services office coordinates accommodations for students, research staff, and faculty alike." },
      { category: CATEGORIES[2], subscore: 82, industryAverage: 62, rationale: "Research-fellowship postings explicitly note accessible interview and assessment formats." },
      { category: CATEGORIES[3], subscore: 86, industryAverage: 68, rationale: "All campus buildings, including laboratories, meet barrier-free access standards following a full-campus retrofit completed two years ago." },
      { category: CATEGORIES[4], subscore: 87, industryAverage: 65, rationale: "A funded peer-support network and assistive-technology lab are both disclosed as standing, budgeted programs." },
    ],
  },
  {
    id: "org-32",
    slug: "shivalik-university",
    name: "Shivalik University",
    type: "UNIVERSITY",
    industry: "Higher Education",
    location: "Chandigarh, Punjab",
    logoUrl: null,
    description: "A private university offering undergraduate programs across engineering, commerce, and design.",
    overallScore: 47,
    verificationLevel: 0,
    methodologyVersion: "placeholder-v0",
    generatedAt: "2026-06-15T00:00:00.000Z",
    breakdown: [
      { category: CATEGORIES[0], subscore: 40, industryAverage: 66, rationale: "The university website has partial accessibility features; no conformance statement is published." },
      { category: CATEGORIES[1], subscore: 46, industryAverage: 64, rationale: "An accommodation process is referenced briefly without a stated response timeline." },
      { category: CATEGORIES[2], subscore: 48, industryAverage: 62, rationale: "Admissions and staff hiring materials reference equal opportunity without disability-specific detail." },
      { category: CATEGORIES[3], subscore: 56, industryAverage: 68, rationale: "Newer academic blocks are barrier-free; older hostel buildings are not addressed in the filing." },
      { category: CATEGORIES[4], subscore: 44, industryAverage: 65, rationale: "No disability-support programs beyond a general student counseling service were disclosed." },
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
// from the client's initial mockup). Replace once the real cutoffs are confirmed;
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
