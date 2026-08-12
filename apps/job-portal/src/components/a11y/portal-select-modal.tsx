"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";
import { setA11yCookieClient } from "@/lib/a11y/cookie";
import type { PortalSelectStep } from "./portal-select-context";

// Placeholder — no real NGO/AT-AD inbox exists yet. Needs a real address
// before this goes live; flagged in the implementation plan.
const PARTNER_EMAIL = "partnerships@blackboxjobs.com";

type NonCandidatePortal = "hr" | "ngo" | "university" | "atad";

export function PortalSelectModal({
  step,
  onClose,
  onSelectCandidate,
  onBack,
}: {
  step: PortalSelectStep;
  onClose: () => void;
  onSelectCandidate: () => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [disability, setDisability] = useState("");
  const [placeholderFor, setPlaceholderFor] = useState<"ngo" | "atad" | null>(null);

  useEffect(() => {
    if (step === "closed") return;
    function onClickAway(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [step, onClose]);

  useEffect(() => {
    if (step === "portal") setPlaceholderFor(null);
    if (step !== "disability") setDisability("");
  }, [step]);

  if (step === "closed") return null;

  function selectNonCandidate(type: NonCandidatePortal) {
    if (type === "ngo" || type === "atad") {
      setPlaceholderFor(type);
      return;
    }
    onClose();
    router.push(type === "university" ? "/signup?role=EMPLOYER&orgType=UNIVERSITY" : "/signup?role=EMPLOYER");
  }

  function continueAsCandidate() {
    if (!disability) return;
    setA11yCookieClient(disability);
    onClose();
    router.push("/signup?role=CANDIDATE");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-select-title"
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-background p-6 shadow-md"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>

        {step === "portal" && (
          <>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Blackbox Jobs</p>
            <h2 id="portal-select-title" className="mt-1 text-xl font-semibold text-foreground">
              How are you joining?
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Pick the account type that matches you — each one lands on a different, purpose-built part of the
              platform.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:grid-rows-2" style={{ minHeight: 320 }}>
              <button
                type="button"
                onClick={onSelectCandidate}
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-6 text-center hover:bg-primary/10 sm:row-span-2"
              >
                <span aria-hidden="true" className="text-4xl">
                  🧑‍💼
                </span>
                <span className="text-lg font-semibold text-primary">Candidates</span>
                <span className="max-w-[18ch] text-xs text-muted-foreground">
                  Build a profile, take one assessment, get matched to real roles.
                </span>
              </button>

              <button
                type="button"
                onClick={() => selectNonCandidate("hr")}
                className="flex flex-col items-start justify-center gap-1.5 rounded-lg border border-border p-4 text-left hover:border-primary hover:shadow-sm"
              >
                <span aria-hidden="true" className="text-2xl">
                  🏢
                </span>
                <span className="text-sm font-semibold text-foreground">HR / Employers</span>
                <span className="text-xs text-muted-foreground">Post roles, review matches, hire.</span>
              </button>

              <button
                type="button"
                onClick={() => selectNonCandidate("ngo")}
                className="flex flex-col items-start justify-center gap-1.5 rounded-lg border border-border p-4 text-left hover:border-primary hover:shadow-sm"
              >
                <span aria-hidden="true" className="text-2xl">
                  🤝
                </span>
                <span className="text-sm font-semibold text-foreground">NGOs</span>
                <span className="text-xs text-muted-foreground">Partner &amp; referral access.</span>
              </button>

              <button
                type="button"
                onClick={() => selectNonCandidate("university")}
                className="flex flex-col items-start justify-center gap-1.5 rounded-lg border border-border p-4 text-left hover:border-primary hover:shadow-sm"
              >
                <span aria-hidden="true" className="text-2xl">
                  🎓
                </span>
                <span className="text-sm font-semibold text-foreground">Universities</span>
                <span className="text-xs text-muted-foreground">Placement cell login.</span>
              </button>

              <button
                type="button"
                onClick={() => selectNonCandidate("atad")}
                className="flex flex-col items-start justify-center gap-1.5 rounded-lg border border-border p-4 text-left hover:border-primary hover:shadow-sm"
              >
                <span aria-hidden="true" className="text-2xl">
                  🦾
                </span>
                <span className="text-sm font-semibold text-foreground">AT / AD</span>
                <span className="text-xs text-muted-foreground">Assistive tech &amp; device partners.</span>
              </button>
            </div>

            {placeholderFor && (
              <div className="mt-4 rounded-md bg-muted p-3.5 text-sm text-foreground">
                We&apos;re building dedicated onboarding for{" "}
                {placeholderFor === "ngo" ? "NGOs" : "assistive tech / device partners"} — reach out and we&apos;ll
                set you up manually:{" "}
                <a href={`mailto:${PARTNER_EMAIL}`} className="font-medium text-primary underline">
                  {PARTNER_EMAIL}
                </a>
                .
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-3.5 w-full rounded-md border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-muted-foreground hover:text-foreground"
            >
              Skip — I&apos;m just looking around
            </button>
          </>
        )}

        {step === "disability" && (
          <>
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <p className="mt-3 text-xs font-semibold tracking-wide text-primary uppercase">
              Candidate sign-up · Step 1
            </p>
            <h2 id="portal-select-title" className="mt-1 text-xl font-semibold text-foreground">
              Which disability category best describes you?
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              This tailors the site&apos;s presentation and your matching from the start — you can add more detail
              (severity, specific needs) once you&apos;re in your profile.
            </p>

            <label htmlFor="portal-disability" className="mt-5 block text-xs font-semibold text-foreground">
              Disability category
            </label>
            <select
              id="portal-disability"
              value={disability}
              onChange={(e) => setDisability(e.target.value)}
              className="mt-1.5 h-touch-target w-full rounded-md border border-border bg-background px-3 text-foreground"
            >
              <option value="" disabled>
                Select one…
              </option>
              {DISABILITY_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!disability}
              onClick={continueAsCandidate}
              className="mt-5 h-touch-target w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              Continue
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              This turns on a matching accessibility mode across the site immediately.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
