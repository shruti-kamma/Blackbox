"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@blackbox/ui";

// UI-only, same honest pattern as the main NGO site's NewsletterForm
// (packages/module-ngo-site) — no backend or email-service wiring exists
// in this repo yet to connect this to.
export function NotifyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-sm font-medium text-primary">Thanks — we&rsquo;ll notify you when the box opens.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-3" noValidate>
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        aria-label="Name"
        className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        aria-label="Email"
        className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
      />
      <label className="flex items-start gap-2 text-left text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5"
        />
        I agree to receive updates from Blackbox Global Foundation.
      </label>
      <Button type="submit" className="self-center">
        NOTIFY ME
      </Button>
    </form>
  );
}
