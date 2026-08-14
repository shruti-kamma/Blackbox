"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface RankingsNavDropdownProps {
  className?: string;
}

export function RankingsNavDropdown({ className = "" }: RankingsNavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click anywhere on the screen
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`group flex items-center gap-1.5 py-1 ${className}`}
      >
        <span>Rankings</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-1 w-44 origin-top-left rounded-lg border border-border bg-background p-1 shadow-xl ring-1 ring-black/5 transition-all focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <Link
            href="/ranking/companies"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:outline-none"
            role="menuitem"
          >
            Companies
          </Link>

          <Link
            href="/ranking/universities"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:outline-none"
            role="menuitem"
          >
            Universities
          </Link>

          <Link
            href="/ranking/methodology"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary focus:bg-muted focus:outline-none"
            role="menuitem"
          >
            Methodology
          </Link>
        </div>
      )}
    </div>
  );
}
