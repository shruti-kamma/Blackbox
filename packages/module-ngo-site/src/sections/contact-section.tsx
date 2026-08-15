"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@blackbox/ui";

const PATHWAYS = ["General", "Partnerships", "Employers", "Opportunities", "Media"];

// UI-only form: client-side state and a local success message, same
// scope boundary as NewsletterForm — no backend/email service exists in
// this repo to submit to yet.
export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;
    setSubmitted(true);
  }

  return (
    <section id="contact" className="scroll-mt-16 border-b border-border bg-muted py-16 md:py-24">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Let&rsquo;s turn intent into action.
          </h2>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {PATHWAYS.map((pathway) => (
              <li key={pathway} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {pathway}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {submitted ? (
            <p className="text-center text-sm font-medium text-primary">
              Thanks for reaching out &mdash; we&rsquo;ll be in touch soon.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
              />
              <input
                type="text"
                name="organisation"
                placeholder="Organisation"
                className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
              />
              <select
                name="reason"
                required
                defaultValue=""
                className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground sm:col-span-2"
              >
                <option value="" disabled>
                  Reason for contacting
                </option>
                {PATHWAYS.map((pathway) => (
                  <option key={pathway} value={pathway}>
                    {pathway}
                  </option>
                ))}
              </select>
              <textarea
                name="message"
                placeholder="Message"
                required
                rows={4}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground sm:col-span-2"
              />
              <label className="flex items-start gap-2 text-xs text-muted-foreground sm:col-span-2">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  className="mt-0.5"
                />
                I consent to Blackbox Global Foundation storing my details to respond to this enquiry.
              </label>
              <Button type="submit" className="self-start sm:col-span-2">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
