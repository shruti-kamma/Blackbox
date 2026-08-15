"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { OrgType } from "@blackbox/rankings-data";

export interface InstitutionSearchOption {
  slug: string;
  name: string;
  type: OrgType;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-muted-foreground"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// Client-side substring match over a pre-fetched, lightweight option list
// (slug/name/type only) rather than a network call per keystroke — the
// full institution set is small enough (companies + universities) that
// this stays fast without a dedicated search endpoint.
export function InstitutionSearch({ options }: { options: InstitutionSearchOption[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return options.filter((o) => o.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, options]);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const showResults = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <label htmlFor="institution-search" className="sr-only">
        Search your institutions
      </label>
      <div className="flex h-touch-target items-center gap-2 rounded-full border border-border bg-background px-4">
        <SearchIcon />
        <input
          id="institution-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search your institutions&hellip;"
          role="combobox"
          aria-expanded={showResults}
          aria-controls="institution-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {showResults && (
        <ul
          id="institution-search-results"
          role="listbox"
          className="absolute top-full z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-background py-1 shadow-md"
        >
          {results.length === 0 ? (
            <li className="px-4 py-2 text-sm text-muted-foreground">No institutions match &ldquo;{query}&rdquo;</li>
          ) : (
            results.map((o) => (
              <li key={o.slug} role="option" aria-selected="false">
                <Link
                  href={`/rankings/organizations/${o.slug}`}
                  className="flex items-center justify-between gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  <span className="truncate">{o.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {o.type === "COMPANY" ? "Company" : "University"}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
