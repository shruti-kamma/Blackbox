import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { sessionCookieOptions, verifySessionToken } from "./session";

export async function getSession() {
  const store = await cookies();
  const token = store.get(sessionCookieOptions.name)?.value;
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { candidateProfile: true },
  });
}

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Not allowed") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireRole(role: "CANDIDATE" | "EMPLOYER" | "ADMIN") {
  const user = await requireUser();
  if (user.role !== role) throw new ForbiddenError(`Requires ${role} role`);
  return user;
}
