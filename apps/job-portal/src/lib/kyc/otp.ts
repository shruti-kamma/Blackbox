import bcrypt from "bcryptjs";
import type { User, VerificationChannel } from "@blackbox/db";
import { prisma } from "@/lib/db";
import { sendEmailOtp, sendPhoneOtp, devCodeVisible } from "./senders";

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

export type VerifyOutcome = "VERIFIED" | "INVALID_CODE" | "EXPIRED" | "TOO_MANY_ATTEMPTS" | "NO_ACTIVE_CODE";

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

  await prisma.$transaction([
    prisma.verificationCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: userId },
      data: channel === "EMAIL" ? { emailVerified: true } : { phoneVerified: true },
    }),
  ]);

  return "VERIFIED";
}
