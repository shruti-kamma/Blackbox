"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { clearA11yCookieClient, readA11yCookieClient } from "@/lib/a11y/cookie";
import { usePortalSelect } from "./portal-select-context";

function labelFor(value: string): string {
  return DISABILITY_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

// Reads the cookie client-side on mount/navigation rather than trusting a
// prop from the server component, since Reset needs to make the pill
// disappear instantly without a full page reload.
export function A11yIndicatorPill() {
  const router = useRouter();
  const { openDisabilityStep } = usePortalSelect();
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    setMode(readA11yCookieClient());
  }, []);

  if (!mode) return null;

  function reset() {
    clearA11yCookieClient();
    setMode(null);
    router.refresh();
  }

  return (
    <div className="fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-full border border-border bg-background py-2 pr-2 pl-4 shadow-md">
      <span className="text-sm font-medium text-foreground">{labelFor(mode)} mode</span>
      <button
        type="button"
        onClick={openDisabilityStep}
        className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
      >
        Change
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}
