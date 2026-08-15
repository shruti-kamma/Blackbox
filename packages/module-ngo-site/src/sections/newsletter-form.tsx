"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@blackbox/ui";

// UI-only: client-side state and a local success message, no backend or
// email-service wiring — no such service exists in this repo to connect
// to yet. `compact` drops the Organisation field and label copy for the
// footer's condensed placement.
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-sm font-medium text-primary">Thanks &mdash; you&rsquo;re on the list.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2" noValidate>
      <div className={compact ? "flex flex-col gap-2" : "grid gap-3 sm:grid-cols-3"}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
        {!compact && (
          <input
            type="text"
            name="organisation"
            placeholder="Organisation"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
          />
        )}
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
          className="mt-0.5"
        />
        I consent to Blackbox Global Foundation storing my details to send updates, in line with applicable Indian
        data protection requirements.
      </label>
      <Button type="submit" size={compact ? "sm" : "default"} className="self-start">
        Subscribe
      </Button>
    </form>
  );
}
