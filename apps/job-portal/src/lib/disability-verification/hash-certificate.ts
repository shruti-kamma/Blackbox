import { createHmac } from "node:crypto";

// A deterministic, keyed hash of a certificate number — never the raw
// number itself, and never a random-salt-per-call scheme like bcrypt
// (which would make equality-based duplicate lookup impossible, since the
// same input would hash differently every time). HMAC-SHA256 with a
// server-side secret gives the same hash for the same input every time,
// which is exactly what's needed to detect "this exact certificate number
// has already been used on a different account" via a plain unique
// column, while the raw number itself is never stored anywhere.
//
// Uses its own dedicated secret (not AUTH_SECRET) — reusing a secret
// across unrelated security purposes is avoidable here, so it is avoided.
export function hashCertificateNumber(raw: string): string {
  const secret = process.env.CERT_HASH_SECRET;
  if (!secret) {
    throw new Error("CERT_HASH_SECRET is not set");
  }
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, "");
  return createHmac("sha256", secret).update(normalized).digest("hex");
}
