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

export const PREFERRED_COMMUNICATION_MODE_OPTIONS = [
  { value: "SIGN_LANGUAGE_INTERPRETER", label: "Sign language interpreter" },
  { value: "SCREEN_READER_COMPATIBLE", label: "Screen-reader-compatible materials" },
  { value: "CAPTIONS_OR_TRANSCRIPT", label: "Captions / live transcript" },
  { value: "EXTRA_RESPONSE_TIME", label: "Extra response time" },
  { value: "WRITTEN_ONLY", label: "Written communication only" },
  { value: "OTHER", label: "Other" },
] as const;

// First-pass mapping from a disability category to the accommodation/
// communication options that actually apply to it — a reasonable
// engineering pass, not informed by disability-inclusion domain expertise,
// worth a sanity-check by someone with that expertise before relying on it
// too heavily. `OTHER` always appears in every category's list (see
// ALWAYS_INCLUDED_ACCOMMODATIONS/_COMMUNICATION_MODES below) so a candidate
// can never be fully blocked from expressing a need this mapping missed.
// Categories with no clear category-specific relevance for a given section
// (e.g. MOBILITY and communication style) intentionally list every option
// rather than guessing a contrived subset — see
// relevantAccommodationsForCategories/relevantCommunicationModesForCategories.
const ACCOMMODATIONS_BY_CATEGORY: Record<string, string[]> = {
  VISUAL: ["SCREEN_READER_SUPPORT", "ASSISTIVE_TECHNOLOGY_STIPEND", "ACCESSIBLE_TRANSPORTATION", "REMOTE_FRIENDLY"],
  HEARING: ["SIGN_LANGUAGE_INTERPRETER", "CAPTIONING", "ASSISTIVE_TECHNOLOGY_STIPEND"],
  MOBILITY: [
    "WHEELCHAIR_ACCESSIBLE_WORKSPACE",
    "ERGONOMIC_WORKSTATION",
    "ACCESSIBLE_TRANSPORTATION",
    "REMOTE_FRIENDLY",
    "FLEXIBLE_HOURS",
  ],
  COGNITIVE: ["EXTENDED_BREAKS", "FLEXIBLE_HOURS", "JOB_COACH_SUPPORT", "REMOTE_FRIENDLY"],
  SPEECH: ["CAPTIONING", "SIGN_LANGUAGE_INTERPRETER", "ASSISTIVE_TECHNOLOGY_STIPEND"],
  CHRONIC_ILLNESS: ["FLEXIBLE_HOURS", "EXTENDED_BREAKS", "REMOTE_FRIENDLY", "ACCESSIBLE_TRANSPORTATION", "ERGONOMIC_WORKSTATION"],
  MENTAL_HEALTH: ["FLEXIBLE_HOURS", "EXTENDED_BREAKS", "REMOTE_FRIENDLY", "JOB_COACH_SUPPORT"],
};

const COMMUNICATION_MODES_BY_CATEGORY: Record<string, string[]> = {
  VISUAL: ["SCREEN_READER_COMPATIBLE", "EXTRA_RESPONSE_TIME"],
  HEARING: ["SIGN_LANGUAGE_INTERPRETER", "CAPTIONS_OR_TRANSCRIPT", "WRITTEN_ONLY"],
  SPEECH: ["WRITTEN_ONLY", "CAPTIONS_OR_TRANSCRIPT"],
  COGNITIVE: ["EXTRA_RESPONSE_TIME", "WRITTEN_ONLY"],
  MENTAL_HEALTH: ["EXTRA_RESPONSE_TIME", "WRITTEN_ONLY"],
  CHRONIC_ILLNESS: ["EXTRA_RESPONSE_TIME", "WRITTEN_ONLY"],
  // MOBILITY intentionally has no entry — no category-specific relevance to
  // communication style, so it falls through to the "show everything" path.
};

const ALWAYS_INCLUDED_ACCOMMODATIONS = ["OTHER"];
const ALWAYS_INCLUDED_COMMUNICATION_MODES = ["OTHER"];

// Union of relevant options across every selected category, plus the
// always-included catch-all. Falls back to the full option list when no
// category is selected yet, `OTHER` is the only category selected, or none
// of the selected categories have a specific mapping for this section —
// there's nothing meaningful to filter against in that case.
export function relevantAccommodationsForCategories(disabilityCategories: string[]): string[] {
  const specific = disabilityCategories.flatMap((c) => ACCOMMODATIONS_BY_CATEGORY[c] ?? []);
  if (specific.length === 0) return ACCOMMODATION_TYPE_OPTIONS.map((o) => o.value);
  return [...new Set([...specific, ...ALWAYS_INCLUDED_ACCOMMODATIONS])];
}

export function relevantCommunicationModesForCategories(disabilityCategories: string[]): string[] {
  const specific = disabilityCategories.flatMap((c) => COMMUNICATION_MODES_BY_CATEGORY[c] ?? []);
  if (specific.length === 0) return PREFERRED_COMMUNICATION_MODE_OPTIONS.map((o) => o.value);
  return [...new Set([...specific, ...ALWAYS_INCLUDED_COMMUNICATION_MODES])];
}

// Same category-relevance reasoning, but for the AssistiveTechnology
// search's `type` filter — reuses the schema's own AssistiveTechnologyType
// enum rather than a separate hand-authored list. Categories without an
// obvious dedicated device type (CHRONIC_ILLNESS, MENTAL_HEALTH) fall back
// to no type filter (searches every type) rather than guessing.
const ASSISTIVE_TECH_TYPES_BY_CATEGORY: Record<string, string[]> = {
  VISUAL: ["VISION_AID", "SCREEN_READER_SOFTWARE"],
  HEARING: ["HEARING_AID"],
  MOBILITY: ["MOBILITY_AID"],
  SPEECH: ["COMMUNICATION_AID"],
  COGNITIVE: ["OTHER_SOFTWARE", "COMMUNICATION_AID"],
};

// Returns null (meaning "no filter, search every type") when no selected
// category has a specific device-type mapping.
export function relevantAssistiveTechTypesForCategories(disabilityCategories: string[]): string[] | null {
  const specific = [...new Set(disabilityCategories.flatMap((c) => ASSISTIVE_TECH_TYPES_BY_CATEGORY[c] ?? []))];
  return specific.length === 0 ? null : specific;
}

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
