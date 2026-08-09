import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "./notification-bell";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="no-print flex h-16 items-center justify-between border-b border-border px-4">
      <Link href="/" className="font-semibold text-foreground">
        Blackbox Jobs
      </Link>
      <nav className="flex items-center gap-4">
        {!user && (
          <>
            <Link href="/login" className="text-sm font-medium text-foreground">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm font-medium text-foreground">
              Sign up
            </Link>
          </>
        )}
        {user?.role === "CANDIDATE" && (
          <>
            <Link href="/candidate/profile" className="text-sm font-medium text-foreground">
              Profile
            </Link>
            <Link href="/candidate/resume" className="text-sm font-medium text-foreground">
              Resume
            </Link>
            <Link href="/candidate/jobs" className="text-sm font-medium text-foreground">
              Matched jobs
            </Link>
            <Link href="/candidate/applications" className="text-sm font-medium text-foreground">
              My applications
            </Link>
            <NotificationBell />
            <LogoutButton />
          </>
        )}
        {user?.role === "EMPLOYER" && (
          <>
            <Link href="/employer" className="text-sm font-medium text-foreground">
              Matched candidates
            </Link>
            <Link href="/employer/jobs" className="text-sm font-medium text-foreground">
              Postings
            </Link>
            <Link href="/employer/jobs/new" className="text-sm font-medium text-foreground">
              Post a job
            </Link>
            <NotificationBell />
            <LogoutButton />
          </>
        )}
        {user?.role === "ADMIN" && (
          <>
            <Link href="/admin" className="text-sm font-medium text-foreground">
              Overview
            </Link>
            <Link href="/admin/coverage" className="text-sm font-medium text-foreground">
              Coverage
            </Link>
            <Link href="/admin/employers" className="text-sm font-medium text-foreground">
              Employers
            </Link>
            <Link href="/admin/candidates" className="text-sm font-medium text-foreground">
              Candidates
            </Link>
            <LogoutButton />
          </>
        )}
      </nav>
    </header>
  );
}
