"use client";

import { createContext, useContext } from "react";

export type PortalSelectStep = "closed" | "portal" | "disability";

export interface PortalSelectContextValue {
  open: () => void;
  openDisabilityStep: () => void;
}

export const PortalSelectContext = createContext<PortalSelectContextValue | null>(null);

export function usePortalSelect(): PortalSelectContextValue {
  const ctx = useContext(PortalSelectContext);
  if (!ctx) throw new Error("usePortalSelect must be used within PortalSelectProvider");
  return ctx;
}
