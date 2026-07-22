import { createHmac, timingSafeEqual } from "node:crypto";

// Minimal stateless session: no Session table, no OAuth, no password reset —
// just enough to know which user/role is making a request. Real auth
// hardening (rotation, revocation, rate limiting) is out of scope for this
// feature; see the final TODO list.

export interface SessionPayload {
  userId: string;
  role: "CANDIDATE" | "EMPLOYER" | "ADMIN";
}

const SESSION_COOKIE = "bb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not set");
  }
  return value;
}

function base64url(input: Buffer): string {
  return input.toString("base64url");
}

export function createSessionToken(payload: SessionPayload): string {
  const body = JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
  const bodyEncoded = base64url(Buffer.from(body, "utf8"));
  const signature = base64url(createHmac("sha256", secret()).update(bodyEncoded).digest());
  return `${bodyEncoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [bodyEncoded, signature] = token.split(".");
  if (!bodyEncoded || !signature) return null;

  const expectedSignature = base64url(createHmac("sha256", secret()).update(bodyEncoded).digest());
  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(bodyEncoded, "base64url").toString("utf8")) as SessionPayload & {
      exp: number;
    };
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  name: SESSION_COOKIE,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
