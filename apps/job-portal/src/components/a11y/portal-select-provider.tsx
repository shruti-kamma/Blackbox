"use client";

import { useState, type ReactNode } from "react";
import { PortalSelectContext, type PortalSelectStep } from "./portal-select-context";
import { PortalSelectModal } from "./portal-select-modal";
import { A11yIndicatorPill } from "./a11y-indicator-pill";

// Mounted once in the root layout. Holds the one piece of state the modal
// and the floating pill both need to share (which step, if any, is open).
export function PortalSelectProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<PortalSelectStep>("closed");

  return (
    <PortalSelectContext.Provider
      value={{
        open: () => setStep("portal"),
        openDisabilityStep: () => setStep("disability"),
      }}
    >
      {children}
      <PortalSelectModal
        step={step}
        onClose={() => setStep("closed")}
        onSelectCandidate={() => setStep("disability")}
        onBack={() => setStep("portal")}
      />
      <A11yIndicatorPill />
    </PortalSelectContext.Provider>
  );
}
