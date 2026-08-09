"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";

type Section = "LISTENING" | "SPEAKING" | "READING" | "WRITING" | "APTITUDE" | "SKILL_BASED";

interface Question {
  id: string;
  order: number;
  section: Section;
  prompt: string;
  passage: string | null;
  options: string[];
  selectedIndex: number | null;
}

type PageState =
  | { kind: "loading" }
  | { kind: "not_started" }
  | { kind: "in_progress"; questions: Question[] }
  | {
      kind: "completed";
      score: number;
      languageScore: number | null;
      aptitudeScore: number | null;
      skillScore: number | null;
    }
  | { kind: "error"; message: string };

const SECTION_LABELS: Record<Section, string> = {
  LISTENING: "Listening",
  SPEAKING: "Speaking",
  READING: "Reading",
  WRITING: "Writing",
  APTITUDE: "Aptitude",
  SKILL_BASED: "Your skills",
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

const LEGEND: { key: string; label: string; className: string }[] = [
  { key: "current", label: "Current", className: "bg-primary" },
  { key: "answered", label: "Answered", className: "bg-success" },
  { key: "not_answered", label: "Not answered", className: "bg-danger" },
  { key: "not_visited", label: "Not visited", className: "border border-border bg-muted" },
  { key: "marked", label: "Marked for review", className: "bg-purple-500" },
  { key: "answered_marked", label: "Answered & marked for review", className: "bg-success ring-2 ring-purple-500" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [index, setIndex] = useState(0);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<
      | { status: "NOT_STARTED" }
      | { status: "IN_PROGRESS"; questions: Question[] }
      | {
          status: "COMPLETED";
          score: number;
          languageScore: number | null;
          aptitudeScore: number | null;
          skillScore: number | null;
        }
    >("/api/candidate/assessment")
      .then((data) => {
        if (data.status === "NOT_STARTED") setState({ kind: "not_started" });
        else if (data.status === "IN_PROGRESS") setState({ kind: "in_progress", questions: data.questions });
        else
          setState({
            kind: "completed",
            score: data.score,
            languageScore: data.languageScore,
            aptitudeScore: data.aptitudeScore,
            skillScore: data.skillScore,
          });
      })
      .catch((err) => {
        setState({ kind: "error", message: err instanceof ApiClientError ? err.message : "Failed to load" });
      });
  }, []);

  // Mark the current question visited whenever it comes into view.
  useEffect(() => {
    if (state.kind !== "in_progress") return;
    const current = state.questions[index];
    if (!current) return;
    setVisited((prev) => (prev.has(current.id) ? prev : new Set(prev).add(current.id)));
  }, [state, index]);

  async function startAssessment() {
    setStarting(true);
    try {
      const data = await apiRequest<{ status: string; questions: Question[] }>("/api/candidate/assessment/start", {
        method: "POST",
      });
      setState({ kind: "in_progress", questions: data.questions });
    } catch (err) {
      setState({ kind: "error", message: err instanceof ApiClientError ? err.message : "Failed to start" });
    } finally {
      setStarting(false);
    }
  }

  function saveAnswerLocally(questionId: string, selectedIndex: number | null) {
    if (state.kind !== "in_progress") return;
    setState({
      kind: "in_progress",
      questions: state.questions.map((q) => (q.id === questionId ? { ...q, selectedIndex } : q)),
    });
  }

  function saveAnswer(questionId: string, selectedIndex: number | null) {
    saveAnswerLocally(questionId, selectedIndex);
    // Autosave, non-blocking — a dropped connection shouldn't lose an
    // otherwise-answered question, but the candidate shouldn't have to wait
    // on it to move to the next one either.
    apiRequest("/api/candidate/assessment/answer", {
      method: "POST",
      body: JSON.stringify({ answerId: questionId, selectedIndex }),
    }).catch(() => {});
  }

  function toggleMarked(questionId: string) {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }

  function goTo(i: number) {
    if (state.kind !== "in_progress") return;
    setIndex(Math.max(0, Math.min(state.questions.length - 1, i)));
  }

  function saveAndNext() {
    goTo(index + 1);
  }

  function markForReviewAndNext() {
    if (state.kind !== "in_progress") return;
    toggleMarked(state.questions[index].id);
    goTo(index + 1);
  }

  function clearResponse() {
    if (state.kind !== "in_progress") return;
    saveAnswer(state.questions[index].id, null);
  }

  async function submitAssessment() {
    if (state.kind !== "in_progress") return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await apiRequest<{
        score: number;
        languageScore: number | null;
        aptitudeScore: number | null;
        skillScore: number | null;
      }>("/api/candidate/assessment/submit", {
        method: "POST",
        body: JSON.stringify({
          answers: state.questions.map((q) => ({ answerId: q.id, selectedIndex: q.selectedIndex ?? -1 })),
        }),
      });
      setState({ kind: "completed", ...result });
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmitClick() {
    if (state.kind !== "in_progress") return;
    const unanswered = state.questions.filter((q) => q.selectedIndex === null).length;
    if (unanswered > 0) {
      setSubmitError(
        `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"} — answer everything before submitting.`,
      );
      return;
    }
    void submitAssessment();
  }

  const current = state.kind === "in_progress" ? state.questions[index] : null;

  const sectionOrder = useMemo(() => {
    if (state.kind !== "in_progress") return [] as Section[];
    const seen = new Set<Section>();
    const order: Section[] = [];
    for (const q of state.questions) {
      if (!seen.has(q.section)) {
        seen.add(q.section);
        order.push(q.section);
      }
    }
    return order;
  }, [state]);

  const firstIndexOfSection = useMemo(() => {
    const map = new Map<Section, number>();
    if (state.kind === "in_progress") {
      state.questions.forEach((q, i) => {
        if (!map.has(q.section)) map.set(q.section, i);
      });
    }
    return map;
  }, [state]);

  const answeredCount = useMemo(
    () => (state.kind === "in_progress" ? state.questions.filter((q) => q.selectedIndex !== null).length : 0),
    [state],
  );

  if (state.kind === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-16">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (state.kind === "error") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-16">
        <p role="alert" className="text-sm text-danger">
          {state.message}
        </p>
      </main>
    );
  }

  if (state.kind === "not_started") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Your assessment</h1>
          <p className="text-sm text-muted-foreground">
            A one-time, 40-question multiple-choice assessment — 15 language questions (adjusted to your
            disability profile), 15 aptitude questions, and 10 based on the skills you listed. Self-paced, no
            timer. You can only take this once, and your answers autosave as you go, so it&apos;s safe to close
            the tab and come back.
          </p>
          <p className="text-sm text-muted-foreground">
            Your score is shared with employers alongside your profile and factors into how strongly you match
            open roles. You&apos;ll be able to apply for jobs once it&apos;s complete.
          </p>
        </div>
        <Button onClick={startAssessment} disabled={starting}>
          {starting ? "Starting…" : "Start assessment"}
        </Button>
      </main>
    );
  }

  if (state.kind === "completed") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground">Assessment complete</h1>
          <p className="text-sm text-muted-foreground">
            You can now apply for jobs. Your score is visible to employers alongside your profile.
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-3xl font-semibold tabular-nums text-foreground">{state.score}%</p>
          <p className="text-sm text-muted-foreground">Overall score</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md border border-border p-3">
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {state.languageScore !== null ? `${state.languageScore}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Language</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {state.aptitudeScore !== null ? `${state.aptitudeScore}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Aptitude</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xl font-semibold tabular-nums text-foreground">
              {state.skillScore !== null ? `${state.skillScore}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Skills</p>
          </div>
        </div>
        <Button onClick={() => router.push("/candidate/jobs")}>Browse matched jobs →</Button>
      </main>
    );
  }

  // in_progress
  if (!current) return null;

  function statusClasses(q: Question, i: number): string {
    if (i === index) return "bg-primary text-primary-foreground";
    const isMarked = marked.has(q.id);
    const isAnswered = q.selectedIndex !== null;
    if (isMarked && isAnswered) return "bg-success text-success-foreground ring-2 ring-purple-500";
    if (isMarked) return "bg-purple-500 text-white";
    if (isAnswered) return "bg-success text-success-foreground";
    if (visited.has(q.id)) return "bg-danger text-danger-foreground";
    return "border border-border bg-muted text-muted-foreground";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Your assessment</h1>
            <div className="mt-2 flex flex-wrap gap-1.5 border-b border-border pb-3">
              {sectionOrder.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => goTo(firstIndexOfSection.get(section) ?? 0)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    current.section === section
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-border"
                  }`}
                >
                  {SECTION_LABELS[section]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Question {index + 1} of {state.questions.length} · {SECTION_LABELS[current.section]}
            </span>
            <span>{answeredCount} answered</span>
          </div>

          <div className="flex flex-col gap-4 rounded-md border border-border p-5">
            {current.passage && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm text-foreground">{current.passage}</p>
                {current.section === "LISTENING" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => speak(current.passage!)}
                  >
                    🔊 Play audio
                  </Button>
                )}
              </div>
            )}
            <fieldset>
              <legend className="text-base font-medium text-foreground">{current.prompt}</legend>
              <div className="mt-3 flex flex-col gap-2">
                {current.options.map((option, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm ${
                      current.selectedIndex === i ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name={current.id}
                      checked={current.selectedIndex === i}
                      onChange={() => saveAnswer(current.id, i)}
                      className="size-4"
                    />
                    <span className="text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-danger">
              {submitError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={markForReviewAndNext}>
                Mark for Review &amp; Next
              </Button>
              <Button type="button" variant="ghost" onClick={clearResponse} disabled={current.selectedIndex === null}>
                Clear Response
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" disabled={index === state.questions.length - 1} onClick={saveAndNext}>
                Save &amp; Next
              </Button>
              <Button type="button" onClick={handleSubmitClick} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-md border border-border p-3">
            <p className="text-sm font-medium text-foreground">Your progress</p>
            <p className="text-xs text-muted-foreground">
              {answeredCount} of {state.questions.length} answered
            </p>
          </div>

          <div className="rounded-md border border-border p-3">
            <p className="mb-2 text-xs font-medium text-foreground">Legend</p>
            <div className="flex flex-col gap-1.5">
              {LEGEND.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`inline-block size-3 shrink-0 rounded-full ${item.className}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {sectionOrder.map((section) => (
              <div key={section} className="rounded-md border border-border p-3">
                <p className="mb-2 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                  {SECTION_LABELS[section]}
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {state.questions.map((q, i) =>
                    q.section === section ? (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goTo(i)}
                        aria-current={i === index}
                        aria-label={`Question ${i + 1}`}
                        className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${statusClasses(q, i)}`}
                      >
                        {i + 1}
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
