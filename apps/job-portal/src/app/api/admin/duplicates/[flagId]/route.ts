import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const resolveSchema = z.object({ status: z.enum(["DISMISSED", "CONFIRMED_DUPLICATE"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ flagId: string }> }) {
  try {
    await requireRole("ADMIN");
    const { flagId } = await params;
    const { status } = resolveSchema.parse(await request.json());

    await prisma.duplicateFlag.update({
      where: { id: flagId },
      data: { status, resolvedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
