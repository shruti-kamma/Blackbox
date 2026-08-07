import { NextResponse } from "next/server";
import { ForbiddenError, requireRole, requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { transcribeAudio } from "@/lib/ai-interview";
import { saveInterviewVideo, readInterviewVideo } from "@/lib/video-storage";

// Candidate uploads one question's video answer — a multipart body with a
// `video` field (full recording, saved for playback) and an `audio` field
// (audio-only track, sent for transcription). Both come from the same live
// getUserMedia stream on the client, recorded by two MediaRecorder instances
// so transcription never depends on a Whisper-family API correctly parsing a
// video container.
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
    if (question.interview.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "This interview is no longer in progress" }, { status: 409 });
    }

    const form = await request.formData();
    const video = form.get("video");
    const audio = form.get("audio");
    if (!(video instanceof Blob) || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing video/audio recording" }, { status: 400 });
    }

    const videoBuffer = Buffer.from(await video.arrayBuffer());
    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    const videoUrl = await saveInterviewVideo(question.interviewId, questionId, videoBuffer);
    const transcript = await transcribeAudio(audioBuffer, audio.type || "audio/webm");

    const updated = await prisma.interviewQuestion.update({
      where: { id: questionId },
      data: { answer: transcript, videoUrl },
    });

    return NextResponse.json({ answer: updated.answer, videoUrl: updated.videoUrl });
  } catch (error) {
    return handleApiError(error);
  }
}

// Streams a stored recording back — either the candidate who recorded it or
// the employer of the job it was recorded for can view it.
export async function GET(request: Request, { params }: { params: Promise<{ jobId: string; questionId: string }> }) {
  try {
    const user = await requireUser();
    const { jobId, questionId } = await params;

    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
      include: { interview: { include: { job: { select: { organizationId: true } } } } },
    });
    if (!question || question.interview.jobId !== jobId || !question.videoUrl) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const isOwningCandidate = user.role === "CANDIDATE" && user.candidateProfile?.id === question.interview.candidateProfileId;
    const isEmployerOfJob = user.role === "EMPLOYER" && user.employerOrgId === question.interview.job.organizationId;
    if (!isOwningCandidate && !isEmployerOfJob) {
      throw new ForbiddenError();
    }

    const buffer = await readInterviewVideo(question.interviewId, questionId);
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "video/webm" } });
  } catch (error) {
    return handleApiError(error);
  }
}
