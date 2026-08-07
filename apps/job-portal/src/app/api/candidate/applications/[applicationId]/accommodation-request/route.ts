import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

const requestSchema = z.object({ text: z.string().trim().min(1).max(2000) });

// Lets a candidate say something the fixed accommodationNeeds checklist
// can't — a specific software version, a particular setup — once they're
// seriously in the running. Gated to INTERVIEWING/OFFERED so it isn't sent
// blind before an employer has shown any real interest.
export async function POST(request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  try {
    const user = await requireRole("CANDIDATE");
    const { applicationId } = await params;
    const { text } = requestSchema.parse(await request.json());

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application || application.candidateId !== user.candidateProfile!.id) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    if (application.status !== "INTERVIEWING" && application.status !== "OFFERED") {
      return NextResponse.json(
        { error: "You can send this once the employer has moved you to interviewing." },
        { status: 409 },
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { accommodationRequestText: text, accommodationRequestSentAt: new Date() },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
