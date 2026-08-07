import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { aiInterviewProvider } from "@/lib/ai-interview";

const startSchema = z.object({ mode: z.enum(["TEXT", "VIDEO"]).default("TEXT") });

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const { jobId } = await params;
    const candidateId = user.candidateProfile!.id;
    const { mode } = startSchema.parse(await request.json().catch(() => ({})));

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        description: true,
        requiresAiInterview: true,
        requiredSkills: { select: { skill: { select: { name: true } } } },
      },
    });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (!job.requiresAiInterview) {
      return NextResponse.json({ error: "This role doesn't require an AI interview" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { jobId_candidateId: { jobId, candidateId } } });
    if (!match) {
      return NextResponse.json({ error: "You can only apply to jobs matched to your profile" }, { status: 403 });
    }

    const existing = await prisma.interview.findUnique({
      where: { jobId_candidateProfileId: { jobId, candidateProfileId: candidateId } },
      include: { questions: { orderBy: { order: "asc" } } },
    });
    if (existing) {
      if (existing.status === "COMPLETED") {
        return NextResponse.json({ error: "You've already completed this interview" }, { status: 409 });
      }
      return NextResponse.json({ interview: existing });
    }

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      select: {
        skills: { select: { skill: { select: { name: true } } } },
        projects: { select: { title: true, techStack: true, description: true } },
      },
    });
    if (!candidate) return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });

    const questions = await aiInterviewProvider.generateQuestions({
      jobTitle: job.title,
      jobDescription: job.description,
      requiredSkills: job.requiredSkills.map((s) => s.skill.name),
      candidateSkills: candidate.skills.map((s) => s.skill.name),
      candidateProjects: candidate.projects,
    });

    const interview = await prisma.interview.create({
      data: {
        jobId,
        candidateProfileId: candidateId,
        mode,
        questions: {
          create: questions.map((question, i) => ({ order: i, question })),
        },
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
