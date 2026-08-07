// Pure logic, DB fetching happens in the caller — same split
// change-detection.ts uses. Two layers stack on top of each other:
//   1. `missing`: what a candidate needs that a specific job doesn't list
//      as offered (candidate.accommodationNeeds - job.accommodationTypes).
//   2. `firstTimeMissing`: of that gap, which has this *employer* never
//      actually provided before, across any role (missing - everProvided).
// Layer 1 is what the Interviewing-stage notification already computes
// inline. Layer 2 is what gates the Offered transition — a job simply not
// listing something isn't grounds to block a hire if the employer has
// clearly handled it before; only genuinely new territory should.

export function computeAccommodationGap(
  candidateNeeds: string[],
  jobAccommodationTypes: string[],
): string[] {
  return candidateNeeds.filter((need) => !jobAccommodationTypes.includes(need));
}

export function computeFirstTimeMissingAccommodations(
  missing: string[],
  everProvidedByOrg: string[],
): string[] {
  return missing.filter((need) => !everProvidedByOrg.includes(need));
}
