import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireUser();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    return handleApiError(error);
  }
}

const markReadSchema = z.object({ ids: z.array(z.string()).min(1) });

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const { ids } = markReadSchema.parse(await request.json());
    await prisma.notification.updateMany({
      where: { id: { in: ids }, userId: user.id },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
