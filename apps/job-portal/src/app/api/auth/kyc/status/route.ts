import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/current-user";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireRole("CANDIDATE");
    return NextResponse.json({ emailVerified: user.emailVerified, phoneVerified: user.phoneVerified });
  } catch (error) {
    return handleApiError(error);
  }
}
