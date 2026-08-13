"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest, ApiClientError } from "@/lib/api-client";

interface LeaderboardEntry {
  rank: number;
  id: string;
  fullName: string;
  level: "EASY" | "MEDIUM" | "HARD";
  isYou: boolean;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  viewerOptedIn: boolean;
  viewerAssessmentCompleted: boolean;
}

const LEVEL_LABELS: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

export default function CandidateLeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  function load() {
    apiRequest<LeaderboardResponse>("/api/candidate/leaderboard")
      .then(setData)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load leaderboard"));
  }

  useEffect(load, []);

  async function join() {
    setJoining(true);
    setError(null);
    try {
      await apiRequest("/api/candidate/leaderboard/opt-in", { method: "POST" });
      load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to join the leaderboard");
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Leaderboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ranked by assessment level reached (Easy, Medium, Hard), not raw score — candidates take different
        question sets depending on accessibility needs and listed skills, so raw score wouldn&apos;t compare
        fairly. Only candidates who&apos;ve opted in appear here.
      </p>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      {data && !data.viewerOptedIn && (
        <div className="mb-6 flex flex-col gap-2 rounded-md border border-border p-4">
          {data.viewerAssessmentCompleted ? (
            <>
              <p className="text-sm text-foreground">You&apos;re not on the leaderboard yet.</p>
              <Button type="button" size="sm" className="self-start" onClick={join} disabled={joining}>
                {joining ? "Joining…" : "Join the leaderboard"}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete your assessment to become eligible to join.{" "}
              <Link href="/candidate/assessment" className="font-medium text-primary underline">
                Take the assessment
              </Link>
            </p>
          )}
        </div>
      )}

      {data === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : data.entries.length === 0 ? (
        <p className="text-muted-foreground">Nobody has joined the leaderboard yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {data.entries.map((entry) => (
            <li
              key={entry.id}
              className={`flex items-center justify-between gap-4 rounded-md border p-3 text-sm ${
                entry.isYou ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 text-right font-mono text-xs text-muted-foreground">#{entry.rank}</span>
                <span className="font-medium text-foreground">
                  {entry.fullName}
                  {entry.isYou && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                </span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{LEVEL_LABELS[entry.level]}</span>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
