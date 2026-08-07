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

export const ACCOMMODATION_TYPE_OPTIONS = [
  { value: "SCREEN_READER_SUPPORT", label: "Screen reader compatible tools" },
  { value: "SIGN_LANGUAGE_INTERPRETER", label: "Sign language interpreter" },
  { value: "CAPTIONING", label: "Captioning / live transcription" },
  { value: "WHEELCHAIR_ACCESSIBLE_WORKSPACE", label: "Wheelchair-accessible workspace" },
  { value: "ASSISTIVE_TECHNOLOGY_STIPEND", label: "Assistive technology stipend" },
  { value: "FLEXIBLE_HOURS", label: "Flexible working hours" },
  { value: "REMOTE_FRIENDLY", label: "Remote-friendly / work from home" },
  { value: "ERGONOMIC_WORKSTATION", label: "Ergonomic / adjustable workstation" },
  { value: "ACCESSIBLE_TRANSPORTATION", label: "Accessible transportation / parking" },
  { value: "EXTENDED_BREAKS", label: "Extended or flexible breaks" },
  { value: "JOB_COACH_SUPPORT", label: "Job coach / on-site support" },
  { value: "OTHER", label: "Other" },
] as const;

export const BODY_PART_OPTIONS = [
  { value: "LEFT_ARM", label: "Left arm" },
  { value: "RIGHT_ARM", label: "Right arm" },
  { value: "BOTH_ARMS", label: "Both arms" },
  { value: "LEFT_LEG", label: "Left leg" },
  { value: "RIGHT_LEG", label: "Right leg" },
  { value: "BOTH_LEGS", label: "Both legs" },
  { value: "HAND", label: "Hand" },
  { value: "SPINE", label: "Spine" },
  { value: "MULTIPLE", label: "Multiple" },
  { value: "OTHER", label: "Other" },
] as const;
