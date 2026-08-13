// Generated 2026-08-13 from services/crawler/data/pwd_extractions/*.json — the 50
// company MVP batch's raw extracted PwD/accessibility fields, not the rolled-up
// 10-metric breakdown (see mock-orgs.ts's ScoreBreakdownItem for that). A one-off
// static snapshot, not a live query — regenerate if the batch changes.
// companyName values are copied verbatim from services/scoring-agent/data/
// scores/*.json (i.e. exactly what load_scores.py wrote as Organization.name in
// Postgres) rather than from selected_companies_50.json — the two sources differ
// on casing/punctuation for 10 of the 50 companies, and this data is joined
// against org.name at render time, so it has to match the DB value exactly.

export interface FieldDisclosureRate {
  field: string;
  label: string;
  count: number;
  total: number;
}

// Sorted ascending (least-disclosed first) — the point of this chart is showing
// what's structurally missing, so the most striking gaps should read first.
export const FIELD_DISCLOSURE_RATES: FieldDisclosureRate[] = [
  { field: "retention_disclosed", label: "Retention/attrition data", count: 0, total: 50 },
  { field: "leadership_representation_disclosed", label: "Leadership representation", count: 0, total: 50 },
  { field: "employee_feedback_disclosed", label: "Employee feedback/grievance data", count: 0, total: 50 },
  { field: "training_or_sensitization_programs", label: "Disability training/sensitization", count: 5, total: 50 },
  { field: "digital_accessibility_measures", label: "Digital accessibility measures", count: 7, total: 50 },
  { field: "accommodation_process_described", label: "Accommodation process described", count: 7, total: 50 },
  { field: "culture_practices_disclosed", label: "Culture practices (ERGs, flex work)", count: 9, total: 50 },
  { field: "recruitment_disclosed", label: "Recruitment targets/outreach", count: 14, total: 50 },
  { field: "compliance_disclosed", label: "Statutory compliance claim", count: 36, total: 50 },
  { field: "physical_accessibility_measures", label: "Physical accessibility measures", count: 49, total: 50 },
  { field: "policy_exists", label: "Written accommodation policy", count: 49, total: 50 },
  { field: "pwd_employee_count_stated", label: "PwD headcount stated", count: 50, total: 50 },
];

export interface PwdHeadcountEntry {
  symbol: string;
  companyName: string;
  // null = the filing's own text couldn't be reconciled to one clean number
  // (see AEGISLOG below) — an honest gap, not a guessed 0.
  pwdEmployees: number | null;
}

// Absolute headcounts as disclosed in each company's BRSR filing — NOT adjusted
// for company size. A company with 50,000 total employees and 200 disclosed PwD
// employees will out-rank one with 500 total employees and 20 disclosed PwD
// employees on this list even though the smaller company's proportion is higher —
// total workforce size wasn't reliably available across all 50 filings to compute
// a fair percentage, so this stays a raw-count view (see the panel's own caption).
export const PWD_HEADCOUNTS: PwdHeadcountEntry[] = [
  { symbol: "ADANIPOWER", companyName: "Adani Power Limited", pwdEmployees: 0 },
  { symbol: "ATGL", companyName: "Adani Total Gas Limited", pwdEmployees: 2 },
  { symbol: "AEGISLOG", companyName: "Aegis Logistics Limited", pwdEmployees: null },
  { symbol: "BHEL", companyName: "BHARAT HEAVY ELECTRICALS LIMITED", pwdEmployees: 888 },
  { symbol: "CGPOWER", companyName: "CG Power and Industrial Solutions Limited", pwdEmployees: 1 },
  { symbol: "ASHOKLEY", companyName: "Ashok Leyland Limited", pwdEmployees: 6 },
  { symbol: "BAJAJ-AUTO", companyName: "Bajaj Auto Limited", pwdEmployees: 3 },
  { symbol: "BHARATFORG", companyName: "Bharat Forge Limited", pwdEmployees: 0 },
  { symbol: "BOSCHLTD", companyName: "BOSCH LIMITED", pwdEmployees: 2 },
  { symbol: "EICHERMOT", companyName: "EICHER MOTORS LIMITED", pwdEmployees: 1 },
  { symbol: "COROMANDEL", companyName: "COROMANDEL INTERNATIONAL LIMITED", pwdEmployees: 10 },
  { symbol: "DEEPAKNTR", companyName: "Deepak Nitrite Limited", pwdEmployees: 2 },
  { symbol: "HSCL", companyName: "Himadri Speciality Chemical Limited", pwdEmployees: 1 },
  { symbol: "LINDEINDIA", companyName: "LINDE INDIA LIMITED", pwdEmployees: 0 },
  { symbol: "NAVINFLUOR", companyName: "Navin Fluorine International Limited", pwdEmployees: 1 },
  { symbol: "AJANTPHARM", companyName: "Ajanta Pharma Limited", pwdEmployees: 10 },
  { symbol: "BIOCON", companyName: "Biocon Limited", pwdEmployees: 27 },
  { symbol: "DIVISLAB", companyName: "DIVI'S LABORATORIES LIMITED", pwdEmployees: 17 },
  { symbol: "DRREDDY", companyName: "Dr. Reddy's Laboratories Limited", pwdEmployees: 124 },
  { symbol: "IPCALAB", companyName: "Ipca Laboratories Limited", pwdEmployees: 2 },
  { symbol: "BRITANNIA", companyName: "Britannia Industries Limited", pwdEmployees: 2 },
  { symbol: "COLPAL", companyName: "Colgate-Palmolive (India) Limited", pwdEmployees: 0 },
  { symbol: "DABUR", companyName: "Dabur India Limited", pwdEmployees: 1 },
  { symbol: "HINDUNILVR", companyName: "Hindustan Unilever Limited", pwdEmployees: 34 },
  { symbol: "ITC", companyName: "ITC Limited", pwdEmployees: 224 },
  { symbol: "BAJFINANCE", companyName: "Bajaj Finance Limited", pwdEmployees: 77 },
  { symbol: "BSE", companyName: "BSE LIMITED", pwdEmployees: 1 },
  { symbol: "CHOLAFIN", companyName: "Cholamandalam Investment and Finance Company Limited", pwdEmployees: 25 },
  { symbol: "HDFCLIFE", companyName: "HDFC Life Insurance Company Limited", pwdEmployees: 24 },
  { symbol: "ICICIGI", companyName: "ICICI Lombard General Insurance Company Limited", pwdEmployees: 10 },
  { symbol: "BANKINDIA", companyName: "BANK OF INDIA", pwdEmployees: 1359 },
  { symbol: "MAHABANK", companyName: "BANK OF MAHARASHTRA", pwdEmployees: 407 },
  { symbol: "CENTRALBK", companyName: "Central Bank of India", pwdEmployees: 898 },
  { symbol: "INDIANB", companyName: "Indian Bank", pwdEmployees: 1210 },
  { symbol: "IOB", companyName: "INDIAN OVERSEAS BANK", pwdEmployees: 531 },
  { symbol: "ADANIENT", companyName: "Adani Enterprises Limited", pwdEmployees: 15 },
  { symbol: "HINDZINC", companyName: "Hindustan Zinc Limited", pwdEmployees: 3 },
  { symbol: "JSWSTEEL", companyName: "JSW Steel Limited", pwdEmployees: 29 },
  { symbol: "LLOYDSME", companyName: "Lloyds Metals And Energy Ltd", pwdEmployees: 3 },
  { symbol: "TATASTEEL", companyName: "Tata Steel Limited", pwdEmployees: 149 },
  { symbol: "ANANTRAJ", companyName: "ANANT RAJ LIMITED", pwdEmployees: 0 },
  { symbol: "BRIGADE", companyName: "Brigade Enterprises Limited", pwdEmployees: 18 },
  { symbol: "GODREJPROP", companyName: "Godrej Properties Limited", pwdEmployees: 76 },
  { symbol: "LODHA", companyName: "LODHA DEVELOPERS LIMITED", pwdEmployees: 1 },
  { symbol: "OBEROIRLTY", companyName: "Oberoi Realty Limited", pwdEmployees: 8 },
  { symbol: "HCLTECH", companyName: "HCL Technologies Limited", pwdEmployees: 1269 },
  { symbol: "PERSISTENT", companyName: "Persistent Systems Limited", pwdEmployees: 58 },
  { symbol: "TCS", companyName: "Tata Consultancy Services Limited", pwdEmployees: 1082 },
  { symbol: "TECHM", companyName: "Tech Mahindra Limited", pwdEmployees: 370 },
  { symbol: "WIPRO", companyName: "Wipro Limited", pwdEmployees: 2537 },
];

