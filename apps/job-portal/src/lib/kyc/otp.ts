import bcrypt from "bcryptjs";
import { Prisma, type User, type VerificationChannel } from "@blackbox/db";
import { prisma } from "@/lib/db";
import { sendEmailOtp, sendPhoneOtp, devCodeVisible } from "./senders";
import { normalizeEmailForDedup, normalizePhone } from "./normalize";

const SALT_ROUNDS = 8;
const CODE_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export class RateLimitedError extends Error {
  constructor(message = "Too many code requests — try again in a few minutes") {
    super(message);
    this.name = "RateLimitedError";
  }
}

export class NoDestinationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoDestinationError";
  }
}

// Invalidates any prior unconsumed code for this (userId, channel), creates
// a fresh one, and sends it. Returns the plaintext code only when
// KYC_DEV_MODE is on, for the verify page to display since there's no real
// inbox/phone to check it against yet.
export async function createAndSendCode(user: User, channel: VerificationChannel): Promise<{ devCode?: string }> {
  const candidate = await prisma.candidateProfile.findUnique({ where: { userId: user.id } });
  const destination = channel === "EMAIL" ? user.email : candidate?.phone;
  if (!destination) {
    throw new NoDestinationError(
      channel === "EMAIL" ? "No email on file" : "No phone number on file — signup should have collected one",
    );
  }

  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.verificationCode.updateMany({
      where: { userId: user.id, channel, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    prisma.verificationCode.create({
      data: {
        userId: user.id,
        channel,
        codeHash,
        expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      },
    }),
  ]);

  if (channel === "EMAIL") {
    await sendEmailOtp(destination, code);
  } else {
    await sendPhoneOtp(destination, code);
  }

  return devCodeVisible() ? { devCode: code } : {};
}

export type VerifyOutcome =
  | "VERIFIED"
  | "INVALID_CODE"
  | "EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "NO_ACTIVE_CODE"
  | "CLAIMED_BY_ANOTHER_ACCOUNT";

// P2002 (unique violation) here means the normalized phone/email is already
// claimed by a different account's completed verification — the DB's unique
// constraint is the source of truth, not a separate check-then-write (which
// would race if two verify requests for the same destination land at once).
function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function verifyCode(userId: string, channel: VerificationChannel, code: string): Promise<VerifyOutcome> {
  const record = await prisma.verificationCode.findFirst({
    where: { userId, channel, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return "NO_ACTIVE_CODE";
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) return "TOO_MANY_ATTEMPTS";
  if (record.expiresAt < new Date()) return "EXPIRED";

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return "INVALID_CODE";
  }

  try {
    if (channel === "EMAIL") {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
      const normalized = normalizeEmailForDedup(user.email);
      await prisma.$transaction([
        prisma.verificationCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
        prisma.user.update({
          where: { id: userId },
          data: { emailVerified: true, emailVerifiedNormalized: normalized },
        }),
      ]);
    } else {
      const candidate = await prisma.candidateProfile.findUniqueOrThrow({
        where: { userId },
        select: { id: true, phone: true },
      });
      const normalized = normalizePhone(candidate.phone ?? "");
      await prisma.$transaction([
        prisma.verificationCode.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
        prisma.user.update({ where: { id: userId }, data: { phoneVerified: true } }),
        prisma.candidateProfile.update({
          where: { id: candidate.id },
          data: { phoneNormalized: normalized, phoneVerifiedNormalized: normalized },
        }),
      ]);
    }
  } catch (error) {
    if (isUniqueViolation(error)) return "CLAIMED_BY_ANOTHER_ACCOUNT";
    throw error;
  }

  return "VERIFIED";
}
