import { NextResponse } from "next/server";
import { z } from "zod";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { scoreAssessment } from "@/lib/assessment/scoring";
import { enqueueMatchingJob } from "@/lib/queue/matching-queue";

const submitSchema = z.object({
  answers: z.array(z.object({ answerId: z.string(), selectedIndex: z.number().int().min(0).max(3) })),
});

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;
    const { answers } = submitSchema.parse(await request.json());

    const assessment = await prisma.candidateAssessment.findUnique({
      where: { candidateProfileId },
      include: { answers: true },
    });
    if (!assessment) {
      return NextResponse.json({ error: "No assessment in progress — start one first" }, { status: 400 });
    }
    if (assessment.status === "COMPLETED") {
      return NextResponse.json({ error: "Assessment already completed" }, { status: 409 });
    }

    const validIds = new Set(assessment.answers.map((a) => a.id));
    if (answers.some((a) => !validIds.has(a.answerId))) {
      return NextResponse.json({ error: "Unknown answer id" }, { status: 400 });
    }
    if (answers.length < assessment.answers.length) {
      return NextResponse.json({ error: "Every question must be answered before submitting" }, { status: 400 });
    }

    const selectedByAnswerId = new Map(answers.map((a) => [a.answerId, a.selectedIndex]));

    await prisma.$transaction(
      assessment.answers.map((a) =>
        prisma.candidateAssessmentAnswer.update({
          where: { id: a.id },
          data: { selectedIndex: selectedByAnswerId.get(a.id) ?? null },
        }),
      ),
    );

    const scored = scoreAssessment(
      assessment.answers.map((a) => ({
        section: a.section,
        correctIndex: a.correctIndex,
        selectedIndex: selectedByAnswerId.get(a.id) ?? null,
      })),
    );

    await prisma.candidateAssessment.update({
      where: { id: assessment.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        score: scored.score,
        languageScore: scored.languageScore,
        aptitudeScore: scored.aptitudeScore,
        skillScore: scored.skillScore,
      },
    });

    // Completing the assessment always changes what the matching engine
    // reads (CandidateForMatching.assessmentScore), unlike a profile edit
    // which needs the isMatchingSubstantialChange diff — always rescore.
    await enqueueMatchingJob({ type: "candidate-profile-updated", candidateProfileId });

    return NextResponse.json({ status: "COMPLETED", ...scored });
  } catch (error) {
    return handleApiError(error);
  }
}
