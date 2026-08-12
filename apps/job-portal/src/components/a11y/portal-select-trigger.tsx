"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePortalSelect } from "./portal-select-context";

// Drop-in replacement for a <Link> that used to go straight to /signup —
// same className/children/style, just opens the portal-select modal instead.
export function PortalSelectTrigger({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { open } = usePortalSelect();
  return (
    <button type="button" onClick={open} className={className} style={style}>
      {children}
    </button>
  );
}
