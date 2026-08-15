"use client";

import { useState } from "react";

export function StayConnectedForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!agreed) {
      setStatus("error");
      setErrorMessage("Please agree to receive updates from Blackbox Global Foundation.");
      return;
    }

    setStatus("submitting");

    // Simulate clean submission handler
    setTimeout(() => {
      setStatus("success");
      setName("");
      setEmail("");
      setAgreed(false);
      setErrorMessage("");
    }, 600);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-card/70 backdrop-blur-md border border-border/80 p-8 sm:p-10 rounded-2xl shadow-xl">
      {status === "success" ? (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-foreground">You&apos;re on the list!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you for connecting with Blackbox Global Foundation. We will notify you as soon as the box opens.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80"
          >
            Submit another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {status === "error" && (
            <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-xs text-danger font-medium">
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="name-input" className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              id="name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-lg border border-border bg-background/90 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email-input" className="block text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full rounded-lg border border-border bg-background/90 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            />
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
            />
            <label htmlFor="consent-checkbox" className="text-xs text-muted-foreground leading-snug cursor-pointer">
              I agree to receive updates from Blackbox Global Foundation.
            </label>
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-xl bg-primary px-6 py-4 text-center font-bold uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {status === "submitting" ? "Submitting..." : "[ NOTIFY ME ]"}
          </button>

          <div className="pt-2 text-center">
            <a
              href="#privacy"
              className="text-xs text-muted-foreground/80 hover:text-foreground transition-colors underline underline-offset-4"
            >
              Privacy Policy
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
