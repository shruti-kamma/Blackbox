import { NextResponse } from "next/server";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { CertificateExtractionError, extractCertificateFields } from "@/lib/disability-verification/extract-certificate";
import { hashCertificateNumber } from "@/lib/disability-verification/hash-certificate";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

export type VerificationOutcome = "VERIFIED" | "MISMATCH" | "UNREADABLE";

// Optional, never mandatory — a candidate can always keep using the
// platform without ever calling this. The uploaded photo is processed
// entirely in memory in this one request and never written to disk,
// anywhere. Only ever persisted: a boolean, a timestamp, and (if a
// certificate number was legible) a salted hash of that number — never the
// raw number, never the image.
export async function POST(request: Request) {
  try {
    const user = await requireVerifiedCandidate();
    const candidateProfileId = user.candidateProfile!.id;

    const formData = await request.formData();

    // Explicit, separate from the file itself — the frontend gates the
    // upload control on this checkbox; this is defense in depth, not the
    // only enforcement. Exact consent wording needs real legal review
    // given DPDP's heightened-consent requirement for disability data —
    // not finalized here.
    if (formData.get("consent") !== "true") {
      return NextResponse.json({ error: "Consent is required before uploading a certificate" }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, or WebP photos are accepted" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "That file is empty" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Photo must be under 8MB" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    // `bytes`/`dataUri` live only in this function's memory and are never
    // written to any file, cache, or log — they fall out of scope when
    // this request finishes.

    let extracted;
    try {
      extracted = await extractCertificateFields(dataUri);
    } catch (error) {
      if (error instanceof CertificateExtractionError) {
        // Soft-fail — a bad photo or a transient AI-provider issue should
        // never block normal platform use, since this feature is optional.
        return NextResponse.json({ outcome: "UNREADABLE" satisfies VerificationOutcome });
      }
      throw error;
    }

    if (!extracted.looksLikeGenuineCertificate || !extracted.category) {
      return NextResponse.json({ outcome: "UNREADABLE" satisfies VerificationOutcome });
    }

    const profile = await prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateProfileId },
      select: { disabilityCategories: true },
    });

    if (!profile.disabilityCategories.includes(extracted.category)) {
      return NextResponse.json({
        outcome: "MISMATCH" satisfies VerificationOutcome,
        extractedCategory: extracted.category,
      });
    }

    let certHash: string | null = null;
    if (extracted.certificateNumber) {
      certHash = hashCertificateNumber(extracted.certificateNumber);
      const existingHolder = await prisma.candidateProfile.findUnique({
        where: { disabilityCertHash: certHash },
        select: { id: true },
      });

      if (existingHolder && existingHolder.id !== candidateProfileId) {
        // A different account already holds this exact certificate number —
        // a strong duplicate-account signal. Flag for admin review rather
        // than blocking this candidate's own verification; don't write the
        // same hash onto this profile too (it's already claimed, and the
        // unique constraint would reject it anyway).
        await prisma.duplicateFlag.upsert({
          where: { candidateProfileId_suspectedDuplicateOfId: { candidateProfileId, suspectedDuplicateOfId: existingHolder.id } },
          update: {},
          create: {
            candidateProfileId,
            suspectedDuplicateOfId: existingHolder.id,
            reason: "matching disability certificate number",
          },
        });
        certHash = null;
      }
    }

    await prisma.candidateProfile.update({
      where: { id: candidateProfileId },
      data: {
        disabilityVerified: true,
        disabilityVerifiedAt: new Date(),
        ...(certHash ? { disabilityCertHash: certHash } : {}),
      },
    });

    return NextResponse.json({ outcome: "VERIFIED" satisfies VerificationOutcome });
  } catch (error) {
    return handleApiError(error);
  }
}
