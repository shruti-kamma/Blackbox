"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";
import { VideoInterviewFlow } from "@/components/video-interview-flow";

interface InterviewQuestion {
  id: string;
  order: number;
  question: string;
  answer: string | null;
}

interface InterviewData {
  id: string;
  status: "IN_PROGRESS" | "COMPLETED";
  mode: "TEXT" | "VIDEO";
  questions: InterviewQuestion[];
}

interface InterviewGetResponse {
  job: { title: string; requiresAiInterview: boolean; organization: { name: string } };
  interview: InterviewData | null;
}

export default function AiInterviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<InterviewGetResponse["job"] | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [needsModeChoice, setNeedsModeChoice] = useState(false);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiRequest<InterviewGetResponse>(`/api/jobs/${jobId}/interview`)
      .then((data) => {
        setJob(data.job);
        if (data.interview) {
          setInterview(data.interview);
        } else {
          setNeedsModeChoice(true);
        }
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load the interview"))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function chooseMode(mode: "TEXT" | "VIDEO") {
    setStarting(true);
    setError(null);
    try {
      const { interview: started } = await apiRequest<{ interview: InterviewData }>(
        `/api/jobs/${jobId}/interview/start`,
        { method: "POST", body: JSON.stringify({ mode }) },
      );
      setInterview(started);
      setNeedsModeChoice(false);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to start the interview");
    } finally {
      setStarting(false);
    }
  }

  async function submitText() {
    if (!interview) return;
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest(`/api/jobs/${jobId}/interview/submit`, {
        method: "POST",
        body: JSON.stringify({
          answers: interview.questions.map((q) => ({ questionId: q.id, answer: textAnswers[q.id] ?? "" })),
        }),
      });
      router.push("/candidate/applications");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit the interview");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <p className="text-muted-foreground">Preparing your interview…</p>
      </main>
    );
  }

  if (error && !interview && !needsModeChoice) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
        <Link href="/candidate/jobs" className="text-sm font-medium text-primary">
          ← Back to matched jobs
        </Link>
      </main>
    );
  }

  if (interview?.status === "COMPLETED") {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Interview already completed</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ve already completed this interview{job ? ` for ${job.title}` : ""}. Your application has
          been sent to the employer.
        </p>
        <Link href="/candidate/applications" className="mt-4 inline-block text-sm font-medium text-primary">
          View my applications →
        </Link>
      </main>
    );
  }

  if (needsModeChoice) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          AI interview{job ? ` — ${job.title}` : ""}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {job?.organization.name} requires a short AI-screened interview before reviewing applications for
          this role. Choose how you&apos;d like to answer — both are evaluated the same way.
        </p>

        {error && (
          <p role="alert" className="mb-4 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button disabled={starting} onClick={() => chooseMode("TEXT")}>
            {starting ? "Starting…" : "Answer with text"}
          </Button>
          <Button variant="secondary" disabled={starting} onClick={() => chooseMode("VIDEO")}>
            {starting ? "Starting…" : "Answer with video"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Video answers use your camera and microphone and are shared with the employer alongside a
          transcript. You can switch back to text any time before submitting.
        </p>
      </main>
    );
  }

  const answeredCount = interview
    ? interview.questions.filter((q) => (textAnswers[q.id] ?? "").trim().length > 0).length
    : 0;
  const allAnswered = interview ? answeredCount === interview.questions.length : false;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">AI interview{job ? ` — ${job.title}` : ""}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {job?.organization.name} requires a short AI-screened interview before reviewing applications for this
        role. Answer each question in your own words — your answers are evaluated and a score is sent to the
        employer along with your profile.
      </p>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {interview && interview.mode === "VIDEO" && (
        <VideoInterviewFlow
          jobId={jobId}
          initialQuestions={interview.questions}
          onFinished={() => router.push("/candidate/applications")}
        />
      )}

      {interview && interview.mode === "TEXT" && (
        <div className="flex flex-col gap-6">
          {interview.questions.map((q, i) => (
            <div key={q.id} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">
                {i + 1}. {q.question}
              </label>
              <textarea
                rows={4}
                value={textAnswers[q.id] ?? ""}
                onChange={(e) => setTextAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="rounded-md border border-border bg-background p-3 text-foreground"
              />
            </div>
          ))}

          <div className="flex items-center gap-3">
            <Button onClick={submitText} disabled={!allAnswered || submitting}>
              {submitting ? "Submitting…" : "Submit interview"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {answeredCount} of {interview.questions.length} answered
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
