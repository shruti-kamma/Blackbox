import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation/auth";
import { handleApiError } from "@/lib/api-error";
import { uniqueOrgSlug } from "@/lib/slugify";

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);

    // Only needed if this signup ends up creating a brand-new Organization
    // (connectOrCreate below just connects if one with this name already
    // exists) — computed up front since Organization.slug is required
    // (the rankings site, ported from the shruti branch, links to an org
    // by slug).
    const newOrgSlug = body.role === "EMPLOYER" ? await uniqueOrgSlug(body.organizationName) : undefined;

    const user =
      body.role === "CANDIDATE"
        ? await prisma.user.create({
            data: {
              email: body.email,
              passwordHash,
              role: "CANDIDATE",
              candidateProfile: { create: { fullName: body.fullName, phone: body.phone } },
            },
          })
        : await prisma.user.create({
            data: {
              email: body.email,
              passwordHash,
              role: "EMPLOYER",
              hrTrainedOnDisabilityHiring: body.hrTrainedOnDisabilityHiring ?? null,
              hrTrainingNotes: body.hrTrainingNotes || null,
              employerOrg: {
                connectOrCreate: {
                  where: { name: body.organizationName },
                  create: { name: body.organizationName, type: body.organizationType, slug: newOrgSlug! },
                },
              },
            },
          });

    const token = createSessionToken({ userId: user.id, role: user.role });
    const response = NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
    response.cookies.set(sessionCookieOptions.name, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
