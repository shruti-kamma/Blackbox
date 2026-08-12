import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { ALLOWED_RESUME_TYPES, MAX_RESUME_BYTES, deleteResumeFile, saveResumeFile } from "@/lib/resume-storage";

// Real file upload — a candidate drops or browses to a resume file rather
// than pasting a link (see CandidateProfile.resumeUrl in schema.prisma for
// what the two fields this writes actually mean).
export async function POST(request: Request) {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const extension = ALLOWED_RESUME_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Only PDF, DOC, or DOCX files are accepted" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "That file is empty" }, { status: 400 });
    }
    if (file.size > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: "Resume must be under 5MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    await saveResumeFile(candidateProfileId, extension, bytes);

    await prisma.candidateProfile.update({
      where: { id: candidateProfileId },
      data: { resumeUrl: extension, resumeFileName: file.name },
    });

    return NextResponse.json({ resumeFileName: file.name });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;

    const profile = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { resumeUrl: true },
    });
    if (profile.resumeUrl) await deleteResumeFile(candidateProfileId, profile.resumeUrl);

    await prisma.candidateProfile.update({
      where: { id: candidateProfileId },
      data: { resumeUrl: null, resumeFileName: null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
