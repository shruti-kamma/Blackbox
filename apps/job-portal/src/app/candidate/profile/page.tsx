"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { TagSearchSelect, ComboSearchSelect } from "@/components/search-select";
import { DatePicker } from "@/components/date-picker";
import { readA11yCookieClient } from "@/lib/a11y/cookie";
import {
  ACCOMMODATION_TYPE_OPTIONS,
  BODY_PART_OPTIONS,
  DISABILITY_CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  PREFERRED_COMMUNICATION_MODE_OPTIONS,
} from "@/lib/matching-options";

interface DisabilityDetailRow {
  severityPercentage: string;
  affectedBodyPart: string;
}

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

interface ProjectRow {
  title: string;
  subtitle: string;
  techStack: string;
  date: string;
  description: string;
  url: string;
}

interface CertificationRow {
  title: string;
  issuer: string;
  date: string;
  url: string;
}

interface ProfileFormState {
  fullName: string;
  headline: string;
  phone: string;
  dateOfBirth: string;
  accessibilityNeeds: string;
  disabilityCategories: string[];
  disabilityOther: string;
  disabilityDetails: Partial<Record<string, DisabilityDetailRow>>;
  accommodationNeeds: string[];
  confirmedNoAccommodationNeeds: boolean;
  preferredCommunicationModes: string[];
  assistiveTechnologies: string;
  experienceLevel: string;
  preferredCategories: string[];
  preferredLocations: string[];
  openToRemote: boolean;
  skills: string[];
  education: EducationRow[];
  workExperience: WorkExperienceRow[];
  projects: ProjectRow[];
  certifications: CertificationRow[];
}

const emptyForm: ProfileFormState = {
  fullName: "",
  headline: "",
  phone: "",
  dateOfBirth: "",
  accessibilityNeeds: "",
  disabilityCategories: [],
  disabilityOther: "",
  disabilityDetails: {},
  accommodationNeeds: [],
  confirmedNoAccommodationNeeds: false,
  preferredCommunicationModes: [],
  assistiveTechnologies: "",
  experienceLevel: "",
  preferredCategories: [],
  preferredLocations: [],
  openToRemote: false,
  skills: [],
  education: [],
  workExperience: [],
  projects: [],
  certifications: [],
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
interface ProfileApiProject {
  title: string;
  subtitle: string | null;
  techStack: string | null;
  date: string | null;
  description: string | null;
  url: string | null;
}
interface ProfileApiCertification {
  title: string;
  issuer: string | null;
  date: string | null;
  url: string | null;
}
interface ProfileApiResponse {
  profile: {
    fullName: string;
    headline: string | null;
    phone: string | null;
    dateOfBirth: string | null;
    resumeUrl: string | null;
    resumeFileName: string | null;
    onboardingCompleted: boolean;
    accessibilityNeeds: string[];
    disabilityCategories: string[];
    disabilityOther: string | null;
    disabilityDetails: {
      category: string;
      severityPercentage: number | null;
      affectedBodyPart: string | null;
    }[];
    accommodationNeeds: string[];
    confirmedNoAccommodationNeeds: boolean;
    preferredCommunicationModes: string[];
    assistiveTechnologies: { assistiveTechnology: { name: string } }[];
    experienceLevel: string | null;
    preferredCategories: string[];
    preferredLocations: string[];
    openToRemote: boolean;
    education: ProfileApiEducation[];
    workExperience: ProfileApiWorkExperience[];
    projects: ProfileApiProject[];
    certifications: ProfileApiCertification[];
    skills: { skill: { name: string } }[];
  } | null;
}

export default function CandidateProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEmptyNeedsPrompt, setShowEmptyNeedsPrompt] = useState(false);
  // Resume file state lives outside the form — uploading goes through its
  // own endpoint (multipart, immediate) rather than the JSON profile PUT.
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeDragOver, setResumeDragOver] = useState(false);

  // First-time "autofill from resume vs. enter manually" choice — "form" is
  // the safe default (shown once onboardingCompleted comes back true, or
  // while still loading, so there's no flash of the choice screen for
  // anyone who's already past it).
  const [step, setStep] = useState<"choice" | "autofill" | "form">("form");
  const [autofillUploading, setAutofillUploading] = useState(false);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [autofillDragOver, setAutofillDragOver] = useState(false);

  useEffect(() => {
    apiRequest<ProfileApiResponse>("/api/candidate/profile")
      .then(({ profile }) => {
        if (!profile) return;
        setResumeFileName(profile.resumeFileName);
        setStep(profile.onboardingCompleted ? "form" : "choice");
        setForm({
          fullName: profile.fullName,
          headline: profile.headline ?? "",
          phone: profile.phone ?? "",
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
          accessibilityNeeds: profile.accessibilityNeeds.join(", "),
          // Non-destructive prefill from the portal-select modal's choice —
          // only applied when the profile has no categories saved yet, and
          // the candidate still has to hit Save for it to actually persist.
          disabilityCategories:
            profile.disabilityCategories.length > 0
              ? profile.disabilityCategories
              : readA11yCookieClient()
                ? [readA11yCookieClient() as string]
                : [],
          disabilityOther: profile.disabilityOther ?? "",
          disabilityDetails: Object.fromEntries(
            profile.disabilityDetails.map((d) => [
              d.category,
              {
                severityPercentage: d.severityPercentage !== null ? String(d.severityPercentage) : "",
                affectedBodyPart: d.affectedBodyPart ?? "",
              },
            ]),
          ),
          accommodationNeeds: profile.accommodationNeeds,
          confirmedNoAccommodationNeeds: profile.confirmedNoAccommodationNeeds,
          preferredCommunicationModes: profile.preferredCommunicationModes,
          assistiveTechnologies: profile.assistiveTechnologies.map((a) => a.assistiveTechnology.name).join(", "),
          experienceLevel: profile.experienceLevel ?? "",
          preferredCategories: profile.preferredCategories,
          preferredLocations: profile.preferredLocations,
          openToRemote: profile.openToRemote,
          skills: profile.skills.map((s) => s.skill.name),
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
          projects: profile.projects.map((p) => ({
            title: p.title,
            subtitle: p.subtitle ?? "",
            techStack: p.techStack ?? "",
            date: p.date ? p.date.slice(0, 10) : "",
            description: p.description ?? "",
            url: p.url ?? "",
          })),
          certifications: profile.certifications.map((c) => ({
            title: c.title,
            issuer: c.issuer ?? "",
            date: c.date ? c.date.slice(0, 10) : "",
            url: c.url ?? "",
          })),
        });
      })
      .catch((err) => {
        if (err instanceof ApiClientError && err.code === "KYC_REQUIRED") {
          router.replace("/signup/verify");
          return;
        }
        setError(err instanceof ApiClientError ? err.message : "Failed to load profile");
      })
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

  async function uploadResume(file: File) {
    setResumeError(null);
    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiRequest<{ resumeFileName: string }>("/api/candidate/resume-upload", {
        method: "POST",
        body: formData,
      });
      setResumeFileName(result.resumeFileName);
    } catch (err) {
      setResumeError(err instanceof ApiClientError ? err.message : "Failed to upload resume");
    } finally {
      setResumeUploading(false);
    }
  }

  async function removeResume() {
    setResumeError(null);
    try {
      await apiRequest("/api/candidate/resume-upload", { method: "DELETE" });
      setResumeFileName(null);
    } catch (err) {
      setResumeError(err instanceof ApiClientError ? err.message : "Failed to remove resume");
    }
  }

  async function markOnboardingChoiceMade() {
    await apiRequest("/api/candidate/profile/onboarding-choice", { method: "POST" }).catch(() => {});
  }

  async function chooseManualEntry() {
    await markOnboardingChoiceMade();
    setStep("form");
  }

  async function uploadForAutofill(file: File) {
    setAutofillError(null);
    setAutofillUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiRequest<{
        resumeFileName: string;
        parsed: {
          fullName: string;
          headline: string;
          phone: string;
          education: EducationRow[];
          workExperience: WorkExperienceRow[];
          skills: string[];
          certifications: CertificationRow[];
          projects: ProjectRow[];
        };
      }>("/api/candidate/resume-autofill", { method: "POST", body: formData });

      setResumeFileName(result.resumeFileName);
      const p = result.parsed;
      setForm((f) => ({
        ...f,
        fullName: p.fullName || f.fullName,
        headline: p.headline || f.headline,
        phone: p.phone || f.phone,
        education: p.education.length > 0 ? p.education : f.education,
        workExperience: p.workExperience.length > 0 ? p.workExperience : f.workExperience,
        skills: p.skills.length > 0 ? Array.from(new Set([...f.skills, ...p.skills])) : f.skills,
        certifications: p.certifications.length > 0 ? p.certifications : f.certifications,
        projects: p.projects.length > 0 ? p.projects : f.projects,
      }));
      await markOnboardingChoiceMade();
      setStep("form");
    } catch (err) {
      setAutofillError(err instanceof ApiClientError ? err.message : "Failed to parse resume");
      // The file itself is saved before parsing is attempted server-side —
      // reflect that here even on a parse failure, so switching to manual
      // entry doesn't ask the candidate to upload it again.
      apiRequest<ProfileApiResponse>("/api/candidate/profile")
        .then(({ profile }) => profile && setResumeFileName(profile.resumeFileName))
        .catch(() => {});
    } finally {
      setAutofillUploading(false);
    }
  }

  function updateDisabilityDetail(category: string, patch: Partial<DisabilityDetailRow>) {
    setForm((f) => ({
      ...f,
      disabilityDetails: {
        ...f.disabilityDetails,
        [category]: {
          severityPercentage: "",
          affectedBodyPart: "",
          ...f.disabilityDetails[category],
          ...patch,
        },
      },
    }));
  }

  function toggleAccommodation(value: string) {
    setForm((f) => ({
      ...f,
      accommodationNeeds: f.accommodationNeeds.includes(value)
        ? f.accommodationNeeds.filter((v) => v !== value)
        : [...f.accommodationNeeds, value],
    }));
  }

  function toggleCommunicationMode(value: string) {
    setForm((f) => ({
      ...f,
      preferredCommunicationModes: f.preferredCommunicationModes.includes(value)
        ? f.preferredCommunicationModes.filter((v) => v !== value)
        : [...f.preferredCommunicationModes, value],
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

  function addProject() {
    setForm((f) => ({
      ...f,
      projects: [...f.projects, { title: "", subtitle: "", techStack: "", date: "", description: "", url: "" }],
    }));
  }
  function removeProject(index: number) {
    setForm((f) => ({ ...f, projects: f.projects.filter((_, i) => i !== index) }));
  }
  function updateProject(index: number, patch: Partial<ProjectRow>) {
    setForm((f) => ({
      ...f,
      projects: f.projects.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  function addCertification() {
    setForm((f) => ({
      ...f,
      certifications: [...f.certifications, { title: "", issuer: "", date: "", url: "" }],
    }));
  }
  function removeCertification(index: number) {
    setForm((f) => ({ ...f, certifications: f.certifications.filter((_, i) => i !== index) }));
  }
  function updateCertification(index: number, patch: Partial<CertificationRow>) {
    setForm((f) => ({
      ...f,
      certifications: f.certifications.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Intercept the very first save with empty needs — everything after
    // that respects whatever they chose, never nagging twice.
    if (form.accommodationNeeds.length === 0 && !form.confirmedNoAccommodationNeeds) {
      setShowEmptyNeedsPrompt(true);
      return;
    }
    void save();
  }

  function confirmHasNeeds() {
    setShowEmptyNeedsPrompt(false);
    document.getElementById("accommodations-fieldset")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function confirmNoNeeds() {
    setShowEmptyNeedsPrompt(false);
    setForm((f) => ({ ...f, confirmedNoAccommodationNeeds: true }));
    void save(true);
  }

  async function save(confirmedNoNeedsOverride = false) {
    setError(null);
    setStatus(null);
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        headline: form.headline || undefined,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        accessibilityNeeds: splitList(form.accessibilityNeeds),
        disabilityCategories: form.disabilityCategories,
        disabilityOther: form.disabilityOther || undefined,
        disabilityDetails: form.disabilityCategories
          .filter((c) => form.disabilityDetails[c])
          .map((c) => {
            const d = form.disabilityDetails[c]!;
            return {
              category: c,
              severityPercentage: d.severityPercentage ? Number(d.severityPercentage) : undefined,
              affectedBodyPart: d.affectedBodyPart || undefined,
            };
          }),
        accommodationNeeds: form.accommodationNeeds,
        confirmedNoAccommodationNeeds: form.confirmedNoAccommodationNeeds || confirmedNoNeedsOverride,
        preferredCommunicationModes: form.preferredCommunicationModes,
        assistiveTechnologies: splitList(form.assistiveTechnologies),
        experienceLevel: form.experienceLevel || undefined,
        preferredCategories: form.preferredCategories,
        preferredLocations: form.preferredLocations,
        openToRemote: form.openToRemote,
        skills: form.skills,
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
        projects: form.projects
          .filter((p) => p.title)
          .map((p) => ({
            title: p.title,
            subtitle: p.subtitle || undefined,
            techStack: p.techStack || undefined,
            date: p.date || undefined,
            description: p.description || undefined,
            url: p.url || undefined,
          })),
        certifications: form.certifications
          .filter((c) => c.title)
          .map((c) => ({
            title: c.title,
            issuer: c.issuer || undefined,
            date: c.date || undefined,
            url: c.url || undefined,
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

  if (step === "choice") {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Let&apos;s build your profile</h1>
        <p className="mt-2 text-muted-foreground">How would you like to get started?</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setStep("autofill")}
            className="flex flex-col items-start gap-2 rounded-lg border-2 border-primary bg-primary/5 p-6 text-left hover:shadow-md"
          >
            <span className="text-2xl">📄</span>
            <span className="text-base font-semibold text-foreground">Autofill using resume</span>
            <span className="text-sm text-muted-foreground">
              Drop in your résumé and we&apos;ll fill in your education, skills, and experience for you to
              review.
            </span>
          </button>
          <button
            type="button"
            onClick={() => void chooseManualEntry()}
            className="flex flex-col items-start gap-2 rounded-lg border border-border p-6 text-left hover:shadow-sm"
          >
            <span className="text-2xl">⌨️</span>
            <span className="text-base font-semibold text-foreground">Enter details manually</span>
            <span className="text-sm text-muted-foreground">
              Fill in your profile yourself, field by field. You can still attach a résumé along the way.
            </span>
          </button>
        </div>
      </main>
    );
  }

  if (step === "autofill") {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16">
        <button
          type="button"
          onClick={() => setStep("choice")}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Autofill from your résumé</h1>
        <p className="mt-2 text-muted-foreground">PDF or DOCX — we&apos;ll pull out what we can find.</p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setAutofillDragOver(true);
          }}
          onDragLeave={() => setAutofillDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setAutofillDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) void uploadForAutofill(file);
          }}
          className={`mt-6 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-10 text-center ${
            autofillDragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {autofillUploading ? (
            <p className="text-sm text-muted-foreground">Reading your résumé…</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Drag and drop your résumé here, or</p>
              <label htmlFor="autofillFile" className="cursor-pointer text-sm font-medium text-primary underline">
                browse from your computer
              </label>
              <p className="text-xs text-muted-foreground">PDF or DOCX — up to 5MB</p>
            </>
          )}
          <input
            id="autofillFile"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            disabled={autofillUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadForAutofill(file);
              e.target.value = "";
            }}
          />
        </div>
        {autofillError && (
          <div className="mt-3 flex flex-col gap-2">
            <p role="alert" className="text-sm text-danger">
              {autofillError}
            </p>
            <button
              type="button"
              onClick={() => void chooseManualEntry()}
              className="self-start text-sm font-medium text-primary underline"
            >
              Enter details manually instead
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight text-foreground">Your profile</h1>
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
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
            />
            <p className="text-xs text-muted-foreground">Shown on your downloadable resume, not on your profile.</p>
          </div>
          <DatePicker
            id="dateOfBirth"
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(v) => setForm((f) => ({ ...f, dateOfBirth: v }))}
            helperText="Optional — not shown to employers."
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="resumeFile" className="text-sm font-medium text-foreground">
              Résumé
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setResumeDragOver(true);
              }}
              onDragLeave={() => setResumeDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setResumeDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) void uploadResume(file);
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center ${
                resumeDragOver ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {resumeFileName ? (
                <>
                  <p className="text-sm font-medium text-foreground">📄 {resumeFileName}</p>
                  <div className="flex gap-3">
                    <label htmlFor="resumeFile" className="cursor-pointer text-sm font-medium text-primary underline">
                      Replace
                    </label>
                    <button
                      type="button"
                      onClick={() => void removeResume()}
                      className="text-sm font-medium text-danger underline"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Drag and drop your résumé here, or</p>
                  <label htmlFor="resumeFile" className="cursor-pointer text-sm font-medium text-primary underline">
                    browse from your computer
                  </label>
                  <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX — up to 5MB</p>
                </>
              )}
              {resumeUploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
              <input
                id="resumeFile"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadResume(file);
                  e.target.value = "";
                }}
              />
            </div>
            {resumeError && (
              <p role="alert" className="text-sm text-danger">
                {resumeError}
              </p>
            )}
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

          {form.disabilityCategories
            .filter((c) => c !== "OTHER")
            .map((category) => {
              const detail = form.disabilityDetails[category] ?? { severityPercentage: "", affectedBodyPart: "" };
              const label = DISABILITY_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? category;
              return (
                <div key={category} className="flex flex-col gap-2 rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{label} details (optional)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`severity-${category}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Disability percentage
                      </label>
                      <input
                        id={`severity-${category}`}
                        type="number"
                        min={0}
                        max={100}
                        inputMode="numeric"
                        value={detail.severityPercentage}
                        onChange={(e) =>
                          updateDisabilityDetail(category, { severityPercentage: e.target.value })
                        }
                        className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                      />
                    </div>
                    {category === "MOBILITY" && (
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`bodypart-${category}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Affected body part
                        </label>
                        <select
                          id={`bodypart-${category}`}
                          value={detail.affectedBodyPart}
                          onChange={(e) =>
                            updateDisabilityDetail(category, { affectedBodyPart: e.target.value })
                          }
                          className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                        >
                          <option value="">Not specified</option>
                          {BODY_PART_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Record-keeping and shown to employers — this doesn&apos;t affect your match score.
                  </p>
                </div>
              );
            })}
        </fieldset>

        <fieldset id="accommodations-fieldset" className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Accommodations you need</legend>
          <div className="flex flex-wrap gap-3">
            {ACCOMMODATION_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.accommodationNeeds.includes(opt.value)}
                  onChange={() => toggleAccommodation(opt.value)}
                  className="size-5"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            This is scored directly against what each employer offers — check everything that applies.
          </p>
        </fieldset>

        <fieldset id="communication-modes-fieldset" className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">
            How you&apos;d prefer to be communicated with during hiring
          </legend>
          <div className="flex flex-wrap gap-3">
            {PREFERRED_COMMUNICATION_MODE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.preferredCommunicationModes.includes(opt.value)}
                  onChange={() => toggleCommunicationMode(opt.value)}
                  className="size-5"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Optional — for interviews and correspondence, not scored in matching. Leave everything unchecked if
            you don&apos;t have a specific preference.
          </p>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="assistiveTechnologies" className="text-sm font-medium text-foreground">
            Assistive technology you use (comma-separated)
          </label>
          <input
            id="assistiveTechnologies"
            value={form.assistiveTechnologies}
            onChange={(e) => setForm((f) => ({ ...f, assistiveTechnologies: e.target.value }))}
            placeholder="JAWS, white cane, crutches"
            className="h-touch-target rounded-md border border-border bg-background px-3 text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Specific devices and software — scored against what employers say they already support.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="accessibilityNeeds" className="text-sm font-medium text-foreground">
            Anything else? (free text, not used in matching)
          </label>
          <input
            id="accessibilityNeeds"
            value={form.accessibilityNeeds}
            onChange={(e) => setForm((f) => ({ ...f, accessibilityNeeds: e.target.value }))}
            placeholder="anything not covered by the checkboxes above"
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

        <TagSearchSelect
          id="skills"
          label="Skills"
          field="skills"
          value={form.skills}
          onChange={(v) => setForm((f) => ({ ...f, skills: v }))}
          placeholder="Search skills, e.g. JavaScript…"
        />

        <TagSearchSelect
          id="preferredCategories"
          label="Preferred job categories"
          field="categories"
          value={form.preferredCategories}
          onChange={(v) => setForm((f) => ({ ...f, preferredCategories: v }))}
          placeholder="Search job categories…"
        />

        <TagSearchSelect
          id="preferredLocations"
          label="Preferred locations"
          field="locations"
          value={form.preferredLocations}
          onChange={(v) => setForm((f) => ({ ...f, preferredLocations: v }))}
          placeholder="Search locations, e.g. Bengaluru…"
        />

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
                <ComboSearchSelect
                  id={`education-field-${i}`}
                  label="Field of study"
                  field="fieldsOfStudy"
                  value={row.fieldOfStudy}
                  onChange={(v) => updateEducation(i, { fieldOfStudy: v })}
                  placeholder="Field of study"
                />
                <ComboSearchSelect
                  id={`education-institution-${i}`}
                  label="Institution"
                  field="institutions"
                  value={row.institution}
                  onChange={(v) => updateEducation(i, { institution: v })}
                  placeholder="Institution / college"
                  required
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

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Projects</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addProject}>
              Add project
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Optional — only shows on your resume if you add at least one. Good for hackathon/competition results
            too: just note the award in the subtitle.
          </p>
          {form.projects.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Project title"
                  placeholder="Project title"
                  value={row.title}
                  onChange={(e) => updateProject(i, { title: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Subtitle"
                  placeholder="Subtitle (e.g. one-liner, or an award note)"
                  value={row.subtitle}
                  onChange={(e) => updateProject(i, { subtitle: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Tech stack"
                  placeholder="Tech stack (e.g. Python, TensorFlow)"
                  value={row.techStack}
                  onChange={(e) => updateProject(i, { techStack: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Date"
                  type="date"
                  value={row.date}
                  onChange={(e) => updateProject(i, { date: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Project URL"
                  type="url"
                  placeholder="Link (optional)"
                  value={row.url}
                  onChange={(e) => updateProject(i, { url: e.target.value })}
                  className="col-span-2 h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
              </div>
              <textarea
                aria-label="Description"
                placeholder="One bullet point per line"
                value={row.description}
                onChange={(e) => updateProject(i, { description: e.target.value })}
                className="rounded-md border border-border bg-background p-2 text-foreground"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeProject(i)}>
                Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Certifications</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addCertification}>
              Add certification
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Optional — only shows on your resume if you add at least one.
          </p>
          {form.certifications.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Certification title"
                  placeholder="Certification title"
                  value={row.title}
                  onChange={(e) => updateCertification(i, { title: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Issuer"
                  placeholder="Issuer"
                  value={row.issuer}
                  onChange={(e) => updateCertification(i, { issuer: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Date"
                  type="date"
                  value={row.date}
                  onChange={(e) => updateCertification(i, { date: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
                <input
                  aria-label="Certification URL"
                  type="url"
                  placeholder="Verification link (optional)"
                  value={row.url}
                  onChange={(e) => updateCertification(i, { url: e.target.value })}
                  className="h-touch-target rounded-md border border-border bg-background px-2 text-foreground"
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(i)}>
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

        {showEmptyNeedsPrompt ? (
          <div className="flex flex-col gap-3 rounded-md border border-border bg-muted p-4">
            <p className="text-sm font-medium text-foreground">
              You haven&apos;t listed any accommodation needs — do you have any?
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={confirmHasNeeds}>
                Yes, let me add them
              </Button>
              <Button type="button" onClick={confirmNoNeeds} disabled={saving}>
                {saving ? "Saving…" : "No, I don't need any"}
              </Button>
            </div>
          </div>
        ) : (
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </Button>
        )}
      </form>
    </main>
  );
}
