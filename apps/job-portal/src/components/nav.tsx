import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "./notification-bell";
import { PortalSelectTrigger } from "./a11y/portal-select-trigger";

// Deliberately hardcoded, not the shared --color-* theme tokens: this bar
// stays dark regardless of the rest of the page's light/dark mode, matching
// the umbrella site's own design (see the landing-page concept it came
// from) rather than following prefers-color-scheme like everything else.
const NAV_BG = "#12151B";
const NAV_BORDER = "#2C313D";
const NAV_TEXT = "#E7E9EE";
const NAV_TEXT_SOFT = "#A0A6B3";
const NAV_ACCENT = "#7FA6D6";
const NAV_CARD = "#1A1E27";

const LINK_CLASS = "text-sm font-medium transition-colors";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header
      className="no-print flex h-16 items-center justify-between gap-6 border-b px-6"
      style={{ backgroundColor: NAV_BG, borderColor: NAV_BORDER }}
    >
      <Link href="/" className="font-serif text-xl font-bold" style={{ color: NAV_TEXT }}>
        Blackbox
        <span style={{ color: NAV_ACCENT }}>.</span>
      </Link>

      <nav className="flex flex-1 items-center justify-center gap-8">
        {!user && (
          <>
            <PortalSelectTrigger className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Job portal
            </PortalSelectTrigger>
            <Link href="/ranking" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Rankings
            </Link>
            <Link href="/#mission" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              About
            </Link>
          </>
        )}
        {user?.role === "CANDIDATE" && (
          <>
            <Link href="/candidate/profile" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Profile
            </Link>
            <Link href="/candidate/resume" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Resume
            </Link>
            <Link href="/candidate/jobs" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Matched jobs
            </Link>
            <Link href="/candidate/applications" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              My applications
            </Link>
          </>
        )}
        {user?.role === "EMPLOYER" && (
          <>
            <Link href="/employer" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Matched candidates
            </Link>
            <Link href="/employer/jobs" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Postings
            </Link>
            <Link href="/employer/jobs/new" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Post a job
            </Link>
          </>
        )}
        {user?.role === "ADMIN" && (
          <>
            <Link href="/admin" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Overview
            </Link>
            <Link href="/admin/coverage" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Coverage
            </Link>
            <Link href="/admin/employers" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Employers
            </Link>
            <Link href="/admin/candidates" className={LINK_CLASS} style={{ color: NAV_TEXT_SOFT }}>
              Candidates
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {!user && (
          <>
            <Link
              href="/login"
              className="flex h-touch-target items-center justify-center rounded-full border px-5 text-sm font-semibold"
              style={{ backgroundColor: NAV_CARD, borderColor: NAV_BORDER, color: NAV_TEXT }}
            >
              Sign in
            </Link>
            <PortalSelectTrigger
              className="flex h-touch-target items-center justify-center rounded-full px-5 text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: NAV_ACCENT, color: NAV_BG }}
            >
              Get started
            </PortalSelectTrigger>
          </>
        )}
        {(user?.role === "CANDIDATE" || user?.role === "EMPLOYER") && <NotificationBell />}
        {user && <LogoutButton className="text-[#E7E9EE] hover:bg-white/10" />}
      </div>
    </header>
  );
}
