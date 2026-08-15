import Link from "next/link";
import { BlackboxLogo } from "@blackbox/ui";

export function NavLogo() {
  return (
    <Link href="/rankings" className="flex items-center gap-3">
      <BlackboxLogo className="h-7 w-auto" />
      <span className="hidden border-l border-border pl-3 text-xs font-medium tracking-wide text-muted-foreground sm:inline">
        xclusively inclusive
      </span>
    </Link>
  );
}
