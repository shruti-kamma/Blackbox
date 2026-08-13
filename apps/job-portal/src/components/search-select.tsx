"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api-client";

export type SuggestField =
  | "skills"
  | "categories"
  | "locations"
  | "institutions"
  | "fieldsOfStudy"
  | "assistiveTechnologies";

const INPUT_CLASS =
  "h-touch-target w-full rounded-md border border-border bg-background px-3 text-foreground";

function useSuggestions(
  field: SuggestField,
  query: string,
  active: boolean,
  extraParams?: Record<string, string>,
) {
  const [options, setOptions] = useState<string[]>([]);
  // Stable key so the effect only re-fires when the actual filter values
  // change, not on every render (a fresh object literal every render would
  // otherwise retrigger this on each keystroke elsewhere in the form).
  const extraParamsKey = extraParams ? JSON.stringify(extraParams) : "";

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ field, q: query, ...(extraParamsKey ? JSON.parse(extraParamsKey) : {}) });
      apiRequest<{ options: string[] }>(`/api/candidate/profile-options?${params.toString()}`)
        .then(({ options }) => {
          if (!cancelled) setOptions(options);
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [field, query, active, extraParamsKey]);

  return options;
}

// Multi-value: existing selections shown as removable chips, typing
// searches real submitted values (see /api/candidate/profile-options),
// and pressing Enter or clicking "Add" on unmatched text adds it as a new
// value — the "Other" fallback, with no separate UI needed for it.
export function TagSearchSelect({
  id,
  label,
  field,
  value,
  onChange,
  helperText,
  placeholder,
  extraParams,
}: {
  id: string;
  label: string;
  field: SuggestField;
  value: string[];
  onChange: (value: string[]) => void;
  helperText?: string;
  placeholder?: string;
  extraParams?: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = useSuggestions(field, query, open, extraParams);
  const filteredOptions = options.filter((o) => !value.includes(o));

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  function addValue(v: string) {
    const trimmed = v.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setQuery("");
  }

  function removeValue(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <li key={v}>
              <button
                type="button"
                onClick={() => removeValue(v)}
                className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-border"
              >
                {v}
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {v}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <input
          id={id}
          type="text"
          value={query}
          placeholder={placeholder ?? "Search or type to add…"}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue(query);
              setOpen(false);
            }
          }}
          className={INPUT_CLASS}
        />
        {open && (query.length > 0 || filteredOptions.length > 0) && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-background shadow-md">
            {filteredOptions.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => {
                    addValue(opt);
                    setOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
                >
                  {opt}
                </button>
              </li>
            ))}
            {query.trim() && !options.some((o) => o.toLowerCase() === query.trim().toLowerCase()) && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    addValue(query);
                    setOpen(false);
                  }}
                  className="block w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-primary hover:bg-muted"
                >
                  Add &ldquo;{query.trim()}&rdquo;
                </button>
              </li>
            )}
            {filteredOptions.length === 0 && !query.trim() && (
              <li className="px-3 py-2 text-xs text-muted-foreground">Start typing to search…</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

// Single-value combobox: type to search real submitted values, click one
// to select it, or just leave whatever you typed — that's the "Other"
// fallback, no extra affordance needed since the field stays editable.
export function ComboSearchSelect({
  id,
  label,
  field,
  value,
  onChange,
  required,
  placeholder,
}: {
  id: string;
  label: string;
  field: SuggestField;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = useSuggestions(field, value, open);

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        className={INPUT_CLASS}
      />
      {open && value.trim() && (
        <ul className="absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-border bg-background shadow-md">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
              >
                {opt}
              </button>
            </li>
          ))}
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-muted-foreground">
              No matches — &ldquo;{value.trim()}&rdquo; will be saved as you&apos;ve typed it.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
