"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BlackboxLogo, Button } from "@blackbox/ui";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#initiatives", label: "Our Flagship Initiatives" },
  { href: "#impact", label: "Impact" },
  { href: "#knowledge", label: "Knowledge & Resources" },
  { href: "#careers", label: "Careers" },
  { href: "#get-involved", label: "Get Involved" },
  { href: "#contact", label: "Contact" },
];

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

// The Foundation's own header — deliberately separate from the job-portal's
// <Nav /> (components/nav.tsx), since this page lives outside the (app)
// route group and isn't part of that product surface. Per the brief,
// Blackbox Index and Nexo are intentionally NOT linked from this nav —
// they only appear as CTAs within page content, so the nav doesn't make
// either initiative look like the parent brand.
export function NgoNav() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/ngo" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <BlackboxLogo className="h-7 w-auto" />
          <span className="hidden border-l border-border pl-3 text-xs font-medium tracking-wide text-muted-foreground sm:inline">
            Xclusively Inclusive.
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="secondary" size="sm">
            <a href="#get-involved">Donate</a>
          </Button>
          <Button asChild variant="primary" size="sm">
            <a href="#contact">Partner With Us</a>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          aria-controls="ngo-mobile-nav-panel"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="flex h-touch-target w-touch-target items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {isOpen && (
        <div
          id="ngo-mobile-nav-panel"
          className="absolute inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background px-4 py-4 shadow-lg lg:hidden"
        >
          <nav aria-label="Primary" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Button asChild variant="secondary">
              <a href="#get-involved" onClick={() => setIsOpen(false)}>Donate</a>
            </Button>
            <Button asChild variant="primary">
              <a href="#contact" onClick={() => setIsOpen(false)}>Partner With Us</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
