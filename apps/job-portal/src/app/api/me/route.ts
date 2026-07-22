import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      hasProfile: Boolean(user.candidateProfile),
      employerOrgId: user.employerOrgId,
    },
  });
}
