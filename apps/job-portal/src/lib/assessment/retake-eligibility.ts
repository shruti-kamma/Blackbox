import type { AssessmentSection } from "@blackbox/db";
import { prisma } from "@/lib/db";
import { applicableLanguageSections } from "./question-bank";

const LANGUAGE_SECTIONS: AssessmentSection[] = ["LISTENING", "SPEAKING", "READING", "WRITING"];

// True only when the two section sets actually differ — self-correcting
// through any number of intermediate profile edits, and provably untriggered
// by an unrelated category change (applicableLanguageSections only branches
// on HEARING/SPEECH), since it compares what was actually tested against
// what should apply right now rather than diffing raw category lists.
export function languageSectionsDiffer(usedSections: AssessmentSection[], applicableSections: AssessmentSection[]): boolean {
  const used = new Set(usedSections);
  const applicable = new Set(applicableSections);
  if (used.size !== applicable.size) return true;
  for (const section of used) {
    if (!applicable.has(section)) return true;
  }
  return false;
}

export interface RetakeEligibility {
  eligible: boolean;
  retakeUsed: boolean;
}

// A candidate is eligible for their one-time language-section retake only
// when: their assessment is COMPLETED, they haven't already used it, and
// the language sections they were actually tested on differ from what
// applies given their current profile (e.g. they've since corrected a
// disability category that adds or removes Listening/Speaking). Only looks
// at the round the candidate actually finished on (`currentRound`) — that
// field never changes again once COMPLETED, so it still correctly points
// at the right round even with multiple difficulty-level rounds now
// sharing the same answers table.
export async function computeRetakeEligibility(candidateProfileId: string): Promise<RetakeEligibility> {
  const assessment = await prisma.candidateAssessment.findUnique({
    where: { candidateProfileId },
    select: { id: true, status: true, retakeUsed: true, currentRound: true },
  });

  if (!assessment || assessment.status !== "COMPLETED") {
    return { eligible: false, retakeUsed: assessment?.retakeUsed ?? false };
  }
  if (assessment.retakeUsed) {
    return { eligible: false, retakeUsed: true };
  }

  const [profile, languageAnswers] = await Promise.all([
    prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { disabilityCategories: true },
    }),
    prisma.candidateAssessmentAnswer.findMany({
      where: { candidateAssessmentId: assessment.id, round: assessment.currentRound, section: { in: LANGUAGE_SECTIONS } },
      select: { section: true },
    }),
  ]);

  const usedSections = [...new Set(languageAnswers.map((a) => a.section))];
  const applicableSections = applicableLanguageSections(profile.disabilityCategories);

  return {
    eligible: languageSectionsDiffer(usedSections, applicableSections),
    retakeUsed: false,
  };
}
