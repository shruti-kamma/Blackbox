// Canonical digit-only form of an Indian mobile number — strips spaces,
// dashes, a leading "+", and a leading "91"/"0" trunk/country-code prefix
// down to the bare 10-digit number, so "+91 98765 43210", "09876543210",
// and "9876543210" all normalize to the same value for duplicate-account
// comparison. Indian mobile numbers only, for now.
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

// Dedup-specific email normalization — lowercase, plus-tag stripped (e.g.
// "user+jobs@gmail.com" -> "user@gmail.com"), so that trick can't be used
// to bypass the duplicate-account check. Deliberately does NOT do
// provider-specific tricks like Gmail's dot-insensitivity — that's a
// lower-confidence guess about mail semantics this function isn't meant to
// make. Not a general-purpose email normalizer — don't reuse for
// login/lookup elsewhere, where the literal address matters.
export function normalizeEmailForDedup(raw: string): string {
  const lower = raw.trim().toLowerCase();
  const at = lower.indexOf("@");
  if (at === -1) return lower;
  const local = lower.slice(0, at).split("+")[0];
  const domain = lower.slice(at);
  return `${local}${domain}`;
}
