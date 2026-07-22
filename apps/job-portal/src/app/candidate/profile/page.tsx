"use client";

import { useEffect, useState } from "react";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import {
  DISABILITY_CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
} from "@/lib/matching-options";

interface EducationRow {
  level: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
}

interface WorkExperienceRow {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

interface ProfileFormState {
  fullName: string;
  headline: string;
  resumeUrl: string;
  accessibilityNeeds: string;
  disabilityCategories: string[];
  disabilityOther: string;
  experienceLevel: string;
  preferredCategories: string;
  preferredLocations: string;
  openToRemote: boolean;
  skills: string;
  education: EducationRow[];
  workExperience: WorkExperienceRow[];
}

const emptyForm: ProfileFormState = {
  fullName: "",
  headline: "",
  resumeUrl: "",
  accessibilityNeeds: "",
  disabilityCategories: [],
  disabilityOther: "",
  experienceLevel: "",
  preferredCategories: "",
  preferredLocations: "",
  openToRemote: false,
  skills: "",
  education: [],
  workExperience: [],
};

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

interface ProfileApiEducation {
  level: string;
  fieldOfStudy: string | null;
  institution: string;
  graduationYear: number | null;
}
interface ProfileApiWorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}
interface ProfileApiResponse {
  profile: {
    fullName: string;
    headline: string | null;
    resumeUrl: string | null;
    accessibilityNeeds: string[];
    disabilityCategories: string[];
    disabilityOther: string | null;
    experienceLevel: string | null;
    preferredCategories: string[];
    preferredLocations: string[];
    openToRemote: boolean;
    education: ProfileApiEducation[];
    workExperience: ProfileApiWorkExperience[];
    skills: { skill: { name: string } }[];
  } | null;
}

export default function CandidateProfilePage() {
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<ProfileApiResponse>("/api/candidate/profile")
      .then(({ profile }) => {
        if (!profile) return;
        setForm({
          fullName: profile.fullName,
          headline: profile.headline ?? "",
          resumeUrl: profile.resumeUrl ?? "",
          accessibilityNeeds: profile.accessibilityNeeds.join(", "),
          disabilityCategories: profile.disabilityCategories,
          disabilityOther: profile.disabilityOther ?? "",
          experienceLevel: profile.experienceLevel ?? "",
          preferredCategories: profile.preferredCategories.join(", "),
          preferredLocations: profile.preferredLocations.join(", "),
          openToRemote: profile.openToRemote,
          skills: profile.skills.map((s) => s.skill.name).join(", "),
          education: profile.education.map((e) => ({
            level: e.level,
            fieldOfStudy: e.fieldOfStudy ?? "",
            institution: e.institution,
            graduationYear: e.graduationYear ? String(e.graduationYear) : "",
          })),
          workExperience: profile.workExperience.map((w) => ({
            title: w.title,
            company: w.company,
            startDate: w.startDate.slice(0, 10),
            endDate: w.endDate ? w.endDate.slice(0, 10) : "",
            isCurrent: w.isCurrent,
            description: w.description ?? "",
          })),
        });
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function toggleDisability(value: string) {
    setForm((f) => ({
      ...f,
      disabilityCategories: f.disabilityCategories.includes(value)
        ? f.disabilityCategories.filter((v) => v !== value)
        : [...f.disabilityCategories, value],
    }));
  }

  function addEducation() {
    setForm((f) => ({
      ...f,
      education: [...f.education, { level: "BACHELORS", fieldOfStudy: "", institution: "", graduationYear: "" }],
    }));
  }
  function removeEducation(index: number) {
    setForm((f) => ({ ...f, education: f.education.filter((_, i) => i !== index) }));
  }
  function updateEducation(index: number, patch: Partial<EducationRow>) {
    setForm((f) => ({
      ...f,
      education: f.education.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  function addWorkExperience() {
    setForm((f) => ({
      ...f,
      workExperience: [
        ...f.workExperience,
        { title: "", company: "", startDate: "", endDate: "", isCurrent: false, description: "" },
      ],
    }));
  }
  function removeWorkExperience(index: number) {
    setForm((f) => ({ ...f, workExperience: f.workExperience.filter((_, i) => i !== index) }));
  }
  function updateWorkExperience(index: number, patch: Partial<WorkExperienceRow>) {
    setForm((f) => ({
      ...f,
      workExperience: f.workExperience.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        headline: form.headline || undefined,
        resumeUrl: form.resumeUrl || undefined,
        accessibilityNeeds: splitList(form.accessibilityNeeds),
        disabilityCategories: form.disabilityCategories,
        disabilityOther: form.disabilityOther || undefined,
        experienceLevel: form.experienceLevel || undefined,
        preferredCategories: splitList(form.preferredCategories),
        preferredLocations: splitList(form.preferredLocations),
        openToRemote: form.openToRemote,
        skills: splitList(form.skills),
        education: form.education
          .filter((e) => e.institution)
          .map((e) => ({
            level: e.level,
            fieldOfStudy: e.fieldOfStudy || undefined,
            institution: e.institution,
            graduationYear: e.graduationYear ? Number(e.graduationYear) : undefined,
          })),
        workExperience: form.workExperience
          .filter((w) => w.title && w.company && w.startDate)
          .map((w) => ({
            title: w.title,
            company: w.company,
            startDate: w.startDate,
            endDate: w.endDate || undefined,
            isCurrent: w.isCurrent,
            description: w.description || undefined,
          })),
      };
      const result = await apiRequest<{ rematchTriggered: boolean }>("/api/candidate/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setStatus(
        result.rematchTriggered
          ? "Profile saved. We're re-checking your matches against currently open jobs."
          : "Profile saved.",
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Your profile</h1>
      <form className="flex flex-col gap-8" onSubmit={onSubmit} noValidate>
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="fullName"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="headline" className="text-sm font-medium text-foreground">
              Headline
            </label>
            <input
              id="headline"
              value={form.headline}
              onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="resumeUrl" className="text-sm font-medium text-foreground">
              Résumé URL
            </label>
            <input
              id="resumeUrl"
              type="url"
              value={form.resumeUrl}
              onChange={(e) => setForm((f) => ({ ...f, resumeUrl: e.target.value }))}
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            />
          </div>
        </section>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Disability categor(y/ies)</legend>
          <div className="flex flex-wrap gap-3">
            {DISABILITY_CATEGORY_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.disabilityCategories.includes(opt.value)}
                  onChange={() => toggleDisability(opt.value)}
                  className="size-5"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {form.disabilityCategories.includes("OTHER") && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="disabilityOther" className="text-sm font-medium text-foreground">
                Please describe
              </label>
              <input
                id="disabilityOther"
                value={form.disabilityOther}
                onChange={(e) => setForm((f) => ({ ...f, disabilityOther: e.target.value }))}
                className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">This is used to match you to roles suited to your needs.</p>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="accessibilityNeeds" className="text-sm font-medium text-foreground">
            Accessibility accommodations you require (comma-separated)
          </label>
          <input
            id="accessibilityNeeds"
            value={form.accessibilityNeeds}
            onChange={(e) => setForm((f) => ({ ...f, accessibilityNeeds: e.target.value }))}
            placeholder="screen reader, flexible hours, captioning"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="experienceLevel" className="text-sm font-medium text-foreground">
            Experience level
          </label>
          <select
            id="experienceLevel"
            value={form.experienceLevel}
            onChange={(e) => setForm((f) => ({ ...f, experienceLevel: e.target.value }))}
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="skills" className="text-sm font-medium text-foreground">
            Skills (comma-separated)
          </label>
          <input
            id="skills"
            value={form.skills}
            onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
            placeholder="JavaScript, React, SQL"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferredCategories" className="text-sm font-medium text-foreground">
            Preferred job categories (comma-separated)
          </label>
          <input
            id="preferredCategories"
            value={form.preferredCategories}
            onChange={(e) => setForm((f) => ({ ...f, preferredCategories: e.target.value }))}
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferredLocations" className="text-sm font-medium text-foreground">
            Preferred locations (comma-separated)
          </label>
          <input
            id="preferredLocations"
            value={form.preferredLocations}
            onChange={(e) => setForm((f) => ({ ...f, preferredLocations: e.target.value }))}
            placeholder="Bengaluru, Mumbai"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.openToRemote}
            onChange={(e) => setForm((f) => ({ ...f, openToRemote: e.target.checked }))}
            className="size-5"
          />
          Open to remote work
        </label>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Education</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addEducation}>
              Add education
            </Button>
          </div>
          {form.education.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Education level"
                  value={row.level}
                  onChange={(e) => updateEducation(i, { level: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                >
                  {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Field of study"
                  placeholder="Field of study"
                  value={row.fieldOfStudy}
                  onChange={(e) => updateEducation(i, { fieldOfStudy: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Institution"
                  placeholder="Institution"
                  value={row.institution}
                  onChange={(e) => updateEducation(i, { institution: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Graduation year"
                  placeholder="Graduation year"
                  inputMode="numeric"
                  value={row.graduationYear}
                  onChange={(e) => updateEducation(i, { graduationYear: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Work experience</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addWorkExperience}>
              Add work experience
            </Button>
          </div>
          {form.workExperience.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Job title"
                  placeholder="Job title"
                  value={row.title}
                  onChange={(e) => updateWorkExperience(i, { title: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Company"
                  placeholder="Company"
                  value={row.company}
                  onChange={(e) => updateWorkExperience(i, { company: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Start date"
                  type="date"
                  value={row.startDate}
                  onChange={(e) => updateWorkExperience(i, { startDate: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="End date"
                  type="date"
                  disabled={row.isCurrent}
                  value={row.endDate}
                  onChange={(e) => updateWorkExperience(i, { endDate: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground disabled:opacity-50"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={row.isCurrent}
                  onChange={(e) => updateWorkExperience(i, { isCurrent: e.target.checked })}
                  className="size-5"
                />
                I currently work here
              </label>
              <textarea
                aria-label="Description"
                placeholder="Description"
                value={row.description}
                onChange={(e) => updateWorkExperience(i, { description: e.target.value })}
                className="rounded-md border border-border bg-background p-2 text-foreground"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeWorkExperience(i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {status && (
          <p role="status" className="text-sm text-success">
            {status}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </main>
  );
}
