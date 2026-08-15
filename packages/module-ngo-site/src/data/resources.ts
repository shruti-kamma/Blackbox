// Homepage teaser categories only — the full searchable library (topic/
// audience/format/year filters) is a follow-up, not built in this pass.
export interface ResourceCategory {
  label: string;
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { label: "Data" },
  { label: "Research" },
  { label: "Reports" },
  { label: "Frameworks" },
  { label: "Policy & Law" },
  { label: "Employer Resources" },
  { label: "CSR & Funding" },
  { label: "Case Studies" },
  { label: "Tools & Guides" },
];
