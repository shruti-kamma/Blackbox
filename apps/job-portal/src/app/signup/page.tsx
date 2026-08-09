"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CANDIDATE" | "EMPLOYER">("CANDIDATE");
  const [hrTrained, setHrTrained] = useState<"" | "YES" | "NO">("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload =
      role === "CANDIDATE"
        ? {
            role,
            email: form.get("email"),
            password: form.get("password"),
            fullName: form.get("fullName"),
            phone: form.get("phone"),
          }
        : {
            role,
            email: form.get("email"),
            password: form.get("password"),
            organizationName: form.get("organizationName"),
            organizationType: form.get("organizationType"),
            hrTrainedOnDisabilityHiring: hrTrained === "" ? undefined : hrTrained === "YES",
            hrTrainingNotes: form.get("hrTrainingNotes") || undefined,
          };
    try {
      await apiRequest("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) });
      router.push(role === "EMPLOYER" ? "/employer/jobs/new" : "/signup/verify");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Create an account</h1>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium text-foreground">I am a</legend>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={role === "CANDIDATE" ? "primary" : "secondary"}
            onClick={() => setRole("CANDIDATE")}
            aria-pressed={role === "CANDIDATE"}
          >
            Candidate
          </Button>
          <Button
            type="button"
            variant={role === "EMPLOYER" ? "primary" : "secondary"}
            onClick={() => setRole("EMPLOYER")}
            aria-pressed={role === "EMPLOYER"}
          >
            Hiring manager
          </Button>
        </div>
      </fieldset>

      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        {role === "CANDIDATE" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                autoComplete="name"
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                minLength={7}
                autoComplete="tel"
                placeholder="+91 98765 43210"
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll send a one-time code here to verify it&apos;s really you, right after this step.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="organizationName" className="text-sm font-medium text-foreground">
                Organization name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="organizationType" className="text-sm font-medium text-foreground">
                Organization type
              </label>
              <select
                id="organizationType"
                name="organizationType"
                defaultValue="COMPANY"
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              >
                <option value="COMPANY">Company</option>
                <option value="UNIVERSITY">University</option>
              </select>
            </div>

            <fieldset className="flex flex-col gap-1.5">
              <legend className="text-sm font-medium text-foreground">
                Have you (or your HR team) received training on hiring people with disabilities?
              </legend>
              <p className="text-xs text-muted-foreground">
                Optional — not required to sign up. Kept internal to help us understand who&apos;s on the
                platform, not shown to candidates.
              </p>
              <select
                aria-label="Have you received training on hiring people with disabilities?"
                value={hrTrained}
                onChange={(e) => setHrTrained(e.target.value as "" | "YES" | "NO")}
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              >
                <option value="">Prefer not to say</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </select>
              {hrTrained === "NO" && (
                <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                  No problem — the{" "}
                  <a
                    href="https://askjan.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline"
                  >
                    Job Accommodation Network (askjan.org)
                  </a>{" "}
                  has free, practical guidance on interviewing and accommodating disabled candidates if you&apos;d
                  like a starting point.
                </p>
              )}
              {hrTrained !== "" && (
                <textarea
                  name="hrTrainingNotes"
                  rows={2}
                  placeholder="Anything you'd like to add? (optional)"
                  className="rounded-md border border-border bg-background p-2 text-sm text-foreground"
                />
              )}
            </fieldset>
          </>
        )}

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
