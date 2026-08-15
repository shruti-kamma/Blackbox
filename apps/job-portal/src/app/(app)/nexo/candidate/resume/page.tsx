"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { ResumeTemplate, type ResumeProfile } from "@/components/resume-template";

export default function ResumePage() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiRequest<{ profile: ResumeProfile }>("/api/candidate/profile"),
      apiRequest<{ user: { email: string } | null }>("/api/me"),
    ])
      .then(([{ profile }, { user }]) => {
        setProfile(profile);
        setEmail(user?.email ?? null);
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load your profile"));
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="no-print mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your resume</h1>
          <p className="text-sm text-muted-foreground">
            Built automatically from your profile. Print or save as PDF to share it outside Blackbox Jobs.
          </p>
        </div>
        <Link href="/nexo/candidate/profile" className="whitespace-nowrap text-sm font-medium text-primary">
          Edit profile →
        </Link>
      </div>

      {error && (
        <p role="alert" className="no-print mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {profile === null ? (
        <p className="no-print text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="no-print mb-6 flex items-center gap-3">
            <Button onClick={() => window.print()}>Print / Save as PDF</Button>
            <p className="text-xs text-muted-foreground">
              Disability category and accommodation details are intentionally left off this document, since
              it&apos;s meant to be shared outside the platform — matched employers still see that
              information on your Blackbox Jobs profile.
            </p>
          </div>

          <div className="resume-print rounded-md border border-border">
            <ResumeTemplate profile={profile} email={email} />
          </div>
        </>
      )}
    </main>
  );
}
