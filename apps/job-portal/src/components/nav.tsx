import { getCurrentUser } from "@/lib/auth/current-user";
import { LogoutButton } from "./logout-button";
import { NotificationBell } from "./notification-bell";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4">
      <a href="/" className="font-semibold text-foreground">
        Blackbox Jobs
      </a>
      <nav className="flex items-center gap-4">
        {!user && (
          <>
            <a href="/login" className="text-sm font-medium text-foreground">
              Sign in
            </a>
            <a href="/signup" className="text-sm font-medium text-foreground">
              Sign up
            </a>
          </>
        )}
        {user?.role === "CANDIDATE" && (
          <>
            <a href="/candidate/profile" className="text-sm font-medium text-foreground">
              Profile
            </a>
            <a href="/candidate/jobs" className="text-sm font-medium text-foreground">
              Matched jobs
            </a>
            <NotificationBell />
            <LogoutButton />
          </>
        )}
        {user?.role === "EMPLOYER" && (
          <>
            <a href="/employer/jobs" className="text-sm font-medium text-foreground">
              Postings
            </a>
            <a href="/employer/jobs/new" className="text-sm font-medium text-foreground">
              Post a job
            </a>
            <LogoutButton />
          </>
        )}
      </nav>
    </header>
  );
}
