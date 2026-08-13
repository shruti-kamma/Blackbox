import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sessionCookieOptions, verifySessionToken } from "./session";

export async function getSession() {
  const store = await cookies();
  const token = store.get(sessionCookieOptions.name)?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  try {
    return await prisma.user.findUnique({
      where: { id: session.userId },
      include: { candidateProfile: true },
    });
  } catch (error) {
    console.warn("Database offline during getCurrentUser check");
    return null;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Not allowed") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class KycRequiredError extends Error {
  constructor(message = "Verify your email and phone before continuing") {
    super(message);
    this.name = "KycRequiredError";
  }
}

export class AssessmentRequiredError extends Error {
  constructor(message = "Complete your assessment before applying to jobs") {
    super(message);
    this.name = "AssessmentRequiredError";
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(role: "CANDIDATE" | "EMPLOYER" | "ADMIN") {
  const user = await requireUser();
  if (user.role !== role) throw new ForbiddenError(`Requires ${role} role`);
  return user;
}

// Same as requireRole("CANDIDATE") but also enforces the KYC gate: a
// candidate can sign up and reach the verify page, but nothing else, until
// both emailVerified and phoneVerified are true.
export async function requireVerifiedCandidate() {
  const user = await requireRole("CANDIDATE");
  if (!user.emailVerified || !user.phoneVerified) throw new KycRequiredError();
  return user;
}

// Platform-wide gate on applying to jobs (not per-job — see the 40-question
// MCQ assessment). Completion is the gate; the score itself is just a
// scored input into match weighting, never a pass/fail bar.
export async function requireAssessedCandidate() {
  const user = await requireVerifiedCandidate();
  const assessment = await prisma.candidateAssessment.findUnique({
    where: { candidateProfileId: user.candidateProfile!.id },
    select: { status: true },
  });
  if (assessment?.status !== "COMPLETED") throw new AssessmentRequiredError();
  return user;
}
