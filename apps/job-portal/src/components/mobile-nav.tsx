"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./notification-bell";
import { LogoutButton } from "./logout-button";
import { PortalSelectTrigger } from "./a11y/portal-select-trigger";
import { NAV_LINKS as RANKING_NAV_LINKS } from "@/lib/ranking-nav";

export type NavUserRole = "CANDIDATE" | "EMPLOYER" | "ADMIN" | null;

export interface MobileNavProps {
  role: NavUserRole;
}

const LINK_CLASS = "block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// Collapses the entire nav (links + auth actions) behind a hamburger below
// the md breakpoint — the desktop <nav>/auth-buttons in Nav (components/
// nav.tsx) are hidden at that width via `hidden md:flex`, so this is the
// only nav UI on small screens rather than a partial/duplicate one. Nav
// stays a server component (it awaits getCurrentUser()); this only needs
// the resolved role as a plain, serializable prop to decide which links
// to show — everything interactive (open/close state, route-change and
// Escape handling) lives here since that needs the client.
export function MobileNav({ role }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-panel"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="flex h-touch-target w-touch-target items-center justify-center rounded-full text-foreground hover:bg-muted"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          className="absolute inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background px-4 py-4 shadow-lg"
        >
          <nav aria-label="Primary" className="flex flex-col gap-1">
            {role === null && (
              <>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rankings
                </p>
                {RANKING_NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <PortalSelectTrigger className={`${LINK_CLASS} w-full text-left`}>Job portal</PortalSelectTrigger>
                <Link href="/rankings#about" className={LINK_CLASS}>
                  About
                </Link>
              </>
            )}
            {role === "CANDIDATE" && (
              <>
                <Link href="/nexo/candidate/profile" className={LINK_CLASS}>
                  Profile
                </Link>
                <Link href="/nexo/candidate/resume" className={LINK_CLASS}>
                  Resume
                </Link>
                <Link href="/nexo/candidate/assessment" className={LINK_CLASS}>
                  Assessment
                </Link>
                <Link href="/nexo/candidate/jobs" className={LINK_CLASS}>
                  Matched jobs
                </Link>
                <Link href="/nexo/candidate/applications" className={LINK_CLASS}>
                  My applications
                </Link>
                <Link href="/nexo/candidate/leaderboard" className={LINK_CLASS}>
                  Leaderboard
                </Link>
              </>
            )}
            {role === "EMPLOYER" && (
              <>
                <Link href="/nexo/employer" className={LINK_CLASS}>
                  Matched candidates
                </Link>
                <Link href="/nexo/employer/jobs" className={LINK_CLASS}>
                  Postings
                </Link>
                <Link href="/nexo/employer/jobs/new" className={LINK_CLASS}>
                  Post a job
                </Link>
              </>
            )}
            {role === "ADMIN" && (
              <>
                <Link href="/nexo/admin" className={LINK_CLASS}>
                  Overview
                </Link>
                <Link href="/nexo/admin/coverage" className={LINK_CLASS}>
                  Coverage
                </Link>
                <Link href="/nexo/admin/employers" className={LINK_CLASS}>
                  Employers
                </Link>
                <Link href="/nexo/admin/candidates" className={LINK_CLASS}>
                  Candidates
                </Link>
                <Link href="/nexo/admin/duplicates" className={LINK_CLASS}>
                  Duplicates
                </Link>
              </>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {role === null && (
              <>
                <Link
                  href="/nexo/login"
                  className="flex h-touch-target items-center justify-center rounded-full border border-border bg-muted px-5 text-sm font-semibold text-foreground"
                >
                  Sign in
                </Link>
                <PortalSelectTrigger className="flex h-touch-target items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  Get started
                </PortalSelectTrigger>
              </>
            )}
            {(role === "CANDIDATE" || role === "EMPLOYER") && (
              <div className="flex items-center justify-between px-1">
                <NotificationBell />
                <LogoutButton />
              </div>
            )}
            {role === "ADMIN" && (
              <div className="px-1">
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
