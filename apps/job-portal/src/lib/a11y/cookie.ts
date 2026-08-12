// The candidate's selected accessibility mode, mirrored into a small,
// non-httpOnly cookie so it can both (a) be read server-side at SSR time in
// the root layout, avoiding a flash of unstyled content on navigation, and
// (b) be read/cleared client-side by the floating indicator pill. Nothing
// sensitive lives here, unlike bb_session — non-httpOnly is required, not
// just tolerated.
export const A11Y_COOKIE_NAME = "bb_a11y";
const A11Y_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function setA11yCookieClient(value: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${A11Y_COOKIE_NAME}=${value}; Path=/; Max-Age=${A11Y_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearA11yCookieClient(): void {
  document.cookie = `${A11Y_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function readA11yCookieClient(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${A11Y_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
