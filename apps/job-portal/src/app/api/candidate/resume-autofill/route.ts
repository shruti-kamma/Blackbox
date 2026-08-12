import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { ALLOWED_RESUME_TYPES, MAX_RESUME_BYTES, saveResumeFile } from "@/lib/resume-storage";
import { extractResumeText } from "@/lib/resume-parsing/extract-text";
import { extractResumeFields } from "@/lib/resume-parsing/extract-fields";

// The "autofill using resume" path on the first-time profile-building
// choice screen. Stores the file exactly like POST /api/candidate/resume-upload
// (so it's already attached — the candidate never has to give it again),
// then parses it and returns structured fields for the frontend to prefill
// the profile form with. Nothing but the file itself is written to the
// database here — the candidate still reviews and hits Save, same as every
// other profile field.
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

    // Save first — even if parsing fails below, the candidate shouldn't
    // have to re-upload; they can just switch to manual entry with the
    // file already attached.
    await saveResumeFile(candidateProfileId, extension, bytes);
    await prisma.candidateProfile.update({
      where: { id: candidateProfileId },
      data: { resumeUrl: extension, resumeFileName: file.name },
    });

    const text = await extractResumeText(bytes, extension);
    const parsed = await extractResumeFields(text);

    return NextResponse.json({ resumeFileName: file.name, parsed });
  } catch (error) {
    return handleApiError(error);
  }
}
