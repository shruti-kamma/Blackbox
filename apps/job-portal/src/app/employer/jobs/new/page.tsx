"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import {
  ACCOMMODATION_TYPE_OPTIONS,
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

interface AssistiveTechInsight {
  name: string;
  count: number;
}

interface DisabilityCategoryCount {
  category: string;
  label: string;
  candidateCount: number;
}

export default function NewJobPage() {
  const router = useRouter();
  const [targetCategories, setTargetCategories] = useState<string[]>([]);
  const [accommodationTypes, setAccommodationTypes] = useState<string[]>([]);
  const [remote, setRemote] = useState(false);
  const [offersGuaranteedInterview, setOffersGuaranteedInterview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [insights, setInsights] = useState<AssistiveTechInsight[] | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number> | null>(null);

  // Platform-wide, fetched once on load — not dependent on which categories
  // are checked, so the count is visible right at the point of selection
  // rather than only after picking one.
  useEffect(() => {
    apiRequest<{ counts: DisabilityCategoryCount[] }>("/api/employer/disability-category-counts")
      .then(({ counts }) =>
        setCategoryCounts(Object.fromEntries(counts.map((c) => [c.category, c.candidateCount]))),
      )
      .catch(() => setCategoryCounts(null));
  }, []);

  function toggleCategory(value: string) {
    setTargetCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  // Live insight into what assistive technology candidates matching these
  // categories already use — informs what to list as preferred below.
  useEffect(() => {
    if (targetCategories.length === 0) return;
    apiRequest<{ insights: AssistiveTechInsight[] }>(
      `/api/employer/assistive-tech-insights?categories=${targetCategories.join(",")}`,
    )
      .then(({ insights }) => setInsights(insights))
      .catch(() => setInsights(null));
  }, [targetCategories]);

  function toggleAccommodationType(value: string) {
    setAccommodationTypes((prev) =>
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
        accommodationTypes,
        requiredEducationLevel: form.get("requiredEducationLevel") || undefined,
        requiredEducationField: form.get("requiredEducationField") || undefined,
        requiredExperienceLevel: form.get("requiredExperienceLevel") || undefined,
        requiredSkills: splitList(String(form.get("requiredSkills") ?? "")),
        preferredAssistiveTechnologies: splitList(String(form.get("preferredAssistiveTechnologies") ?? "")),
        offersGuaranteedInterview,
        essentialSkills: splitList(String(form.get("essentialSkills") ?? "")),
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
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Post a job</h1>
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
                <span className="text-xs text-muted-foreground">
                  {categoryCounts
                    ? `(${categoryCounts[opt.value] ?? 0} candidate${categoryCounts[opt.value] === 1 ? "" : "s"})`
                    : ""}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Leave all unchecked to mark this role open to all.</p>
        </fieldset>

        {targetCategories.length > 0 && insights && (
          <div className="rounded-md border border-border bg-muted p-3">
            <p className="text-sm font-medium text-foreground">Assistive technology in this candidate pool</p>
            {insights.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                No candidates with these categories have listed assistive technology yet.
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  Candidates on the platform with these categories most often use:
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {insights.map((i) => (
                    <li
                      key={i.name}
                      className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
                    >
                      {i.name} ({i.count})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferredAssistiveTechnologies" className="text-sm font-medium text-foreground">
            Preferred assistive technology experience (comma-separated)
          </label>
          <input
            id="preferredAssistiveTechnologies"
            name="preferredAssistiveTechnologies"
            placeholder="JAWS, NVDA"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Optional — scored as a soft preference, not a hard requirement. Use the insight above to see what
            candidates already know.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Accommodations you can offer</legend>
          <div className="flex flex-wrap gap-3">
            {ACCOMMODATION_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={accommodationTypes.includes(opt.value)}
                  onChange={() => toggleAccommodationType(opt.value)}
                  className="size-5"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Scored directly against what candidates say they need — check everything this role actually offers.
          </p>
          {targetCategories.length > 0 && accommodationTypes.length === 0 && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-foreground">
              You&apos;ve targeted {targetCategories.length === 1 ? "a category" : "categories"} above but
              haven&apos;t checked any accommodations — candidates with real needs won&apos;t see what you
              provide until you do. You can still post without this, but it&apos;s worth a second look.
            </p>
          )}
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

        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={offersGuaranteedInterview}
              onChange={(e) => setOffersGuaranteedInterview(e.target.checked)}
              className="size-5"
            />
            Guarantee an interview to candidates who meet my must-have skills
          </label>
          <p className="text-xs text-muted-foreground">
            Shown to candidates as a badge on this job. Not tied to overall match score — just the specific
            skills you mark essential below, so the promise is something you defined yourself.
          </p>
          {offersGuaranteedInterview && (
            <div className="flex flex-col gap-1.5 pt-1">
              <label htmlFor="essentialSkills" className="text-sm font-medium text-foreground">
                Which required skills are must-haves? (comma-separated, subset of the list above)
              </label>
              <input
                id="essentialSkills"
                name="essentialSkills"
                placeholder="JavaScript, React"
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if you don&apos;t want to require any specific skill — any matched candidate will
                then qualify for the guarantee.
              </p>
            </div>
          )}
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
            Anything else? (free text, not used in matching)
          </label>
          <input
            id="accommodationsOffered"
            name="accommodationsOffered"
            placeholder="anything not covered by the checkboxes above"
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
