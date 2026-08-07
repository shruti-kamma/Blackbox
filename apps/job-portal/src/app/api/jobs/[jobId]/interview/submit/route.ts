import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { aiInterviewProvider } from "@/lib/ai-interview";
import { createApplicationFromMatch } from "@/lib/applications";

const submitSchema = z.object({
  answers: z.array(z.object({ questionId: z.string(), answer: z.string().trim() })).default([]),
});

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const { jobId } = await params;
    const candidateId = user.candidateProfile!.id;
    const { answers } = submitSchema.parse(await request.json());

    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { title: true, description: true } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const interview = await prisma.interview.findUnique({
      where: { jobId_candidateProfileId: { jobId, candidateProfileId: candidateId } },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (!interview) return NextResponse.json({ error: "No interview in progress for this role" }, { status: 404 });
    if (interview.status === "COMPLETED") {
      return NextResponse.json({ error: "You've already completed this interview" }, { status: 409 });
    }

    // Text mode sends every answer here; video mode sends none — those
    // answers were already saved (as transcripts) by the video upload route.
    // Only overwrite what's actually present in this request, otherwise keep
    // whatever's already stored.
    const submittedByQuestionId = new Map(answers.map((a) => [a.questionId, a.answer]));
    const resolvedAnswers = interview.questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: submittedByQuestionId.get(q.id) ?? q.answer ?? "",
    }));

    const unanswered = resolvedAnswers.filter((q) => !q.answer);
    if (unanswered.length > 0) {
      return NextResponse.json({ error: "Please answer all questions before submitting." }, { status: 400 });
    }

    await Promise.all(
      resolvedAnswers.map((q) => prisma.interviewQuestion.update({ where: { id: q.id }, data: { answer: q.answer } })),
    );

    const evaluation = await aiInterviewProvider.evaluateAnswers({
      jobTitle: job.title,
      jobDescription: job.description,
      qaPairs: resolvedAnswers.map((q) => ({ question: q.question, answer: q.answer })),
    });

    await Promise.all(
      interview.questions.map((q, i) =>
        prisma.interviewQuestion.update({
          where: { id: q.id },
          data: { feedback: evaluation.perQuestionFeedback[i] ?? null },
        }),
      ),
    );

    const completed = await prisma.interview.update({
      where: { id: interview.id },
      data: {
        status: "COMPLETED",
        overallScore: evaluation.overallScore,
        overallSummary: evaluation.overallSummary,
        completedAt: new Date(),
      },
    });

    const application = await createApplicationFromMatch({
      jobId,
      candidateId,
      interviewId: completed.id,
    });

    return NextResponse.json({ application, interview: completed });
  } catch (error) {
    return handleApiError(error);
  }
}
