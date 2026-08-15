"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLogo() {
  const pathname = usePathname();
  const isRanking = pathname?.startsWith("/ranking");

  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="font-serif text-xl font-bold tracking-tight text-foreground">
        Blackbox<span className="text-primary">.</span>
      </span>
      {isRanking && (
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold tracking-wide text-foreground border border-border font-sans">
          INDEX
        </span>
      )}
    </Link>
  );
}
