import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@blackbox/ui";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "./notification-bell";
import { PortalSelectTrigger } from "./a11y/portal-select-trigger";
import { NavLogo } from "./nav-logo";
import { NAV_LINKS as RANKING_NAV_LINKS } from "@/lib/ranking-nav";

// Follows the shared --color-* theme tokens (light/dark, and the a11y
// presentation modes that also override them) like every other page,
// instead of a previous hardcoded-always-dark palette.
const LINK_CLASS = "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="no-print flex h-16 items-center justify-between gap-6 border-b border-border bg-background px-6">
      <NavLogo />

      <nav className="flex flex-1 items-center justify-center gap-8">
        {!user && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger className={`${LINK_CLASS} flex items-center gap-1 outline-none`}>
                Rankings
                <ChevronDownIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {RANKING_NAV_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <PortalSelectTrigger className={LINK_CLASS}>Job portal</PortalSelectTrigger>
            <Link href="/#about" className={LINK_CLASS}>
              About
            </Link>
          </>
        )}
        {user?.role === "CANDIDATE" && (
          <>
            <Link href="/candidate/profile" className={LINK_CLASS}>
              Profile
            </Link>
            <Link href="/candidate/resume" className={LINK_CLASS}>
              Resume
            </Link>
            <Link href="/candidate/assessment" className={LINK_CLASS}>
              Assessment
            </Link>
            <Link href="/candidate/jobs" className={LINK_CLASS}>
              Matched jobs
            </Link>
            <Link href="/candidate/applications" className={LINK_CLASS}>
              My applications
            </Link>
            <Link href="/candidate/leaderboard" className={LINK_CLASS}>
              Leaderboard
            </Link>
          </>
        )}
        {user?.role === "EMPLOYER" && (
          <>
            <Link href="/employer" className={LINK_CLASS}>
              Matched candidates
            </Link>
            <Link href="/employer/jobs" className={LINK_CLASS}>
              Postings
            </Link>
            <Link href="/employer/jobs/new" className={LINK_CLASS}>
              Post a job
            </Link>
          </>
        )}
        {user?.role === "ADMIN" && (
          <>
            <Link href="/admin" className={LINK_CLASS}>
              Overview
            </Link>
            <Link href="/admin/coverage" className={LINK_CLASS}>
              Coverage
            </Link>
            <Link href="/admin/employers" className={LINK_CLASS}>
              Employers
            </Link>
            <Link href="/admin/candidates" className={LINK_CLASS}>
              Candidates
            </Link>
            <Link href="/admin/duplicates" className={LINK_CLASS}>
              Duplicates
            </Link>
          </>
        )}
      </nav>

      <div className="flex items-center gap-3">
        {!user && (
          <>
            <Link
              href="/login"
              className="flex h-touch-target items-center justify-center rounded-full border border-border bg-muted px-5 text-sm font-semibold text-foreground"
            >
              Sign in
            </Link>
            <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Get started
            </PortalSelectTrigger>
          </>
        )}
        {(user?.role === "CANDIDATE" || user?.role === "EMPLOYER") && <NotificationBell />}
        {user && <LogoutButton />}
      </div>
    </header>
  );
}
