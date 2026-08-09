import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { verifyCode } from "@/lib/kyc/otp";
import { verifyCodeSchema } from "@/lib/validation/auth";
import { handleApiError } from "@/lib/api-error";

const OUTCOME_MESSAGES: Record<string, string> = {
  INVALID_CODE: "That code isn't right — check and try again",
  EXPIRED: "That code expired — request a new one",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts — request a new code",
  NO_ACTIVE_CODE: "No code was sent for this — request one first",
};

export async function POST(request: Request) {
  try {
    const user = await requireRole("CANDIDATE");
    const body = verifyCodeSchema.parse(await request.json());

    const outcome = await verifyCode(user.id, body.channel, body.code);
    if (outcome !== "VERIFIED") {
      return NextResponse.json({ error: OUTCOME_MESSAGES[outcome], outcome }, { status: 400 });
    }

    return NextResponse.json({ verified: true, channel: body.channel });
  } catch (error) {
    return handleApiError(error);
  }
}
