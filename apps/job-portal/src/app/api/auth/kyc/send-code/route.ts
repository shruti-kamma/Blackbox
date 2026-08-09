import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { createAndSendCode } from "@/lib/kyc/otp";
import { checkAndConsumeSendRateLimit } from "@/lib/kyc/rate-limit";
import { sendCodeSchema } from "@/lib/validation/auth";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const user = await requireRole("CANDIDATE");
    const body = sendCodeSchema.parse(await request.json());

    const alreadyVerified = body.channel === "EMAIL" ? user.emailVerified : user.phoneVerified;
    if (alreadyVerified) {
      return NextResponse.json({ error: `${body.channel === "EMAIL" ? "Email" : "Phone"} already verified` }, { status: 409 });
    }

    const allowed = await checkAndConsumeSendRateLimit(user.id, body.channel);
    if (!allowed) {
      return NextResponse.json({ error: "Too many code requests — try again in a few minutes" }, { status: 429 });
    }

    const { devCode } = await createAndSendCode(user, body.channel);
    return NextResponse.json({ sent: true, ...(devCode ? { devCode } : {}) });
  } catch (error) {
    return handleApiError(error);
  }
}
