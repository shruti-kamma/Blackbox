import { NextResponse } from "next/server";
import { z } from "zod";
import { requireVerifiedCandidate } from "@/lib/auth/current-user";
import { verifyPassword } from "@/lib/auth/password";
import { sessionCookieOptions } from "@/lib/auth/session";
import { deleteAccount } from "@/lib/account/delete-account";
import { handleApiError } from "@/lib/api-error";

const deleteSchema = z.object({ password: z.string().min(1) });

// Candidate self-service account deletion — a real DPDP Act (right to
// erasure) requirement, not just a nice-to-have. Requires re-entering the
// current password as confirmation, same reasoning as any other
// destructive-action confirmation: a stray click on a "Delete my account"
// button should never be enough on its own.
export async function DELETE(request: Request) {
  try {
    const user = await requireVerifiedCandidate();
    const { password } = deleteSchema.parse(await request.json());

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    await deleteAccount(user.id);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions.name, "", { ...sessionCookieOptions, maxAge: 0 });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
