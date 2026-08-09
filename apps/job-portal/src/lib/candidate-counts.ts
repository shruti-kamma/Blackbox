import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";

type DisabilityCategoryValue = (typeof DISABILITY_CATEGORY_OPTIONS)[number]["value"];

// Pure — DB fetching happens in the caller (same split as
// lib/matching/change-detection.ts and accommodation-gap.ts). Shared by the
// admin coverage page (supply/demand gap analysis) and the employer
// job-posting form (a live count at the point of selecting target
// categories), so the two views can never silently disagree on the number.
export function countCandidatesByDisabilityCategory(
  candidates: { disabilityCategories: DisabilityCategoryValue[] }[],
): { category: DisabilityCategoryValue; label: string; candidateCount: number }[] {
  return DISABILITY_CATEGORY_OPTIONS.map(({ value, label }) => ({
    category: value,
    label,
    candidateCount: candidates.filter((c) => c.disabilityCategories.includes(value)).length,
  }));
}
