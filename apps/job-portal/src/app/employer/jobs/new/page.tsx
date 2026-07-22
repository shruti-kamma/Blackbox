"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import {
  DISABILITY_CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/lib/matching-options";

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function NewJobPage() {
  const router = useRouter();
  const [targetCategories, setTargetCategories] = useState<string[]>([]);
  const [remote, setRemote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleCategory(value: string) {
    setTargetCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const payload = {
        title: form.get("title"),
        description: form.get("description"),
        category: form.get("category"),
        location: form.get("location") || undefined,
        remote,
        employmentType: form.get("employmentType") || undefined,
        accommodationsOffered: splitList(String(form.get("accommodationsOffered") ?? "")),
        targetDisabilityCategories: targetCategories,
        requiredEducationLevel: form.get("requiredEducationLevel") || undefined,
        requiredEducationField: form.get("requiredEducationField") || undefined,
        requiredExperienceLevel: form.get("requiredExperienceLevel") || undefined,
        requiredSkills: splitList(String(form.get("requiredSkills") ?? "")),
      };
      const { job } = await apiRequest<{ job: { id: string } }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/employer/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Post a job</h1>
      <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Job title
          </label>
          <input
            id="title"
            name="title"
            required
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className="rounded-md border border-border bg-background p-3 text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Category
          </label>
          <input
            id="category"
            name="category"
            required
            placeholder="Engineering, Design, Customer Support…"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Target disability categories</legend>
          <div className="flex flex-wrap gap-3">
            {DISABILITY_CATEGORY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={targetCategories.includes(opt.value)}
                  onChange={() => toggleCategory(opt.value)}
                  className="size-5"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Leave all unchecked to mark this role open to all.</p>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="requiredSkills" className="text-sm font-medium text-foreground">
            Required skills (comma-separated)
          </label>
          <input
            id="requiredSkills"
            name="requiredSkills"
            placeholder="JavaScript, React, SQL"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="requiredEducationLevel" className="text-sm font-medium text-foreground">
              Required education level
            </label>
            <select
              id="requiredEducationLevel"
              name="requiredEducationLevel"
              defaultValue=""
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            >
              <option value="">Not specified</option>
              {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="requiredEducationField" className="text-sm font-medium text-foreground">
              Required field of study
            </label>
            <input
              id="requiredEducationField"
              name="requiredEducationField"
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="requiredExperienceLevel" className="text-sm font-medium text-foreground">
            Required experience level
          </label>
          <select
            id="requiredExperienceLevel"
            name="requiredExperienceLevel"
            defaultValue=""
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          >
            <option value="">Not specified</option>
            {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="location" className="text-sm font-medium text-foreground">
              Location
            </label>
            <input
              id="location"
              name="location"
              disabled={remote}
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="employmentType" className="text-sm font-medium text-foreground">
              Employment type
            </label>
            <input
              id="employmentType"
              name="employmentType"
              placeholder="full-time, contract…"
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="size-5"
          />
          Remote role
        </label>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="accommodationsOffered" className="text-sm font-medium text-foreground">
            Accommodations offered (comma-separated)
          </label>
          <input
            id="accommodationsOffered"
            name="accommodationsOffered"
            placeholder="flexible hours, screen-reader-compatible tooling"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post job"}
        </Button>
      </form>
    </main>
  );
}
