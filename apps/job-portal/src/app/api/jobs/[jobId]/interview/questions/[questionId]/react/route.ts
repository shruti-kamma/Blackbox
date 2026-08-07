import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { aiInterviewProvider } from "@/lib/ai-interview";

// A short, in-the-moment reaction to one answer during a live video
// interview — called right after that question's video upload returns a
// transcript. Not persisted; purely conversational, separate from the final
// batch evaluation in interview/submit.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string; questionId: string }> },
) {
  try {
    const user = await requireRole("CANDIDATE");
    const { jobId, questionId } = await params;
    const candidateId = user.candidateProfile!.id;

    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: { interview: true },
    });
    if (!question || question.interview.jobId !== jobId || question.interview.candidateProfileId !== candidateId) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    if (!question.answer) {
      return NextResponse.json({ error: "Answer this question before requesting a reaction" }, { status: 400 });
    }

    const reaction = await aiInterviewProvider.reactToAnswer({ question: question.question, answer: question.answer });

    return NextResponse.json({ reaction });
  } catch (error) {
    return handleApiError(error);
  }
}
