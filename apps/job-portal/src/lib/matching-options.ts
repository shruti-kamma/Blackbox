export const DISABILITY_CATEGORY_OPTIONS = [
  { value: "VISUAL", label: "Visual" },
  { value: "HEARING", label: "Hearing" },
  { value: "MOBILITY", label: "Mobility" },
  { value: "COGNITIVE", label: "Cognitive" },
  { value: "SPEECH", label: "Speech" },
  { value: "CHRONIC_ILLNESS", label: "Chronic illness" },
  { value: "MENTAL_HEALTH", label: "Mental health" },
  { value: "OTHER", label: "Other" },
] as const;

export const EDUCATION_LEVEL_OPTIONS = [
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "DIPLOMA", label: "Diploma" },
  { value: "ASSOCIATE", label: "Associate degree" },
  { value: "BACHELORS", label: "Bachelor's degree" },
  { value: "MASTERS", label: "Master's degree" },
  { value: "DOCTORATE", label: "Doctorate" },
  { value: "OTHER", label: "Other" },
] as const;

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "ENTRY", label: "Entry-level" },
  { value: "MID", label: "Mid-level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
] as const;
