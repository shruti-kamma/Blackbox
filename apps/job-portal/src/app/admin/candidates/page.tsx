"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { DISABILITY_CATEGORY_OPTIONS } from "@/lib/matching-options";

const DISABILITY_LABELS = Object.fromEntries(
  DISABILITY_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

interface CandidateRow {
  id: string;
  fullName: string;
  disabilityCategories: string[];
  profileCompletionPercent: number;
  matchesCount: number;
  applicationsCount: number;
  hiresCount: number;
  signedUpAt: string;
}

type SortKey = "fullName" | "profileCompletionPercent" | "matchesCount" | "applicationsCount" | "signedUpAt";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("signedUpAt");

  useEffect(() => {
    apiRequest<{ candidates: CandidateRow[] }>("/api/admin/candidates").then(({ candidates }) =>
      setCandidates(candidates),
    );
  }, []);

  const sorted = useMemo(() => {
    if (!candidates) return null;
    const copy = [...candidates];
    copy.sort((a, b) => {
      if (sortKey === "fullName") return a.fullName.localeCompare(b.fullName);
      if (sortKey === "signedUpAt") return new Date(b.signedUpAt).getTime() - new Date(a.signedUpAt).getTime();
      return b[sortKey] - a[sortKey];
    });
    return copy;
  }, [candidates, sortKey]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Candidates</h1>
      <p className="mb-6 text-sm text-muted-foreground">Every candidate on the platform.</p>

      {sorted === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4">
                  <button onClick={() => setSortKey("fullName")} className="font-medium hover:text-foreground">
                    Name
                  </button>
                </th>
                <th className="py-2 pr-4">Disability categories</th>
                <th className="py-2 pr-4">
                  <button
                    onClick={() => setSortKey("profileCompletionPercent")}
                    className="font-medium hover:text-foreground"
                  >
                    Profile
                  </button>
                </th>
                <th className="py-2 pr-4">
                  <button onClick={() => setSortKey("matchesCount")} className="font-medium hover:text-foreground">
                    Matches
                  </button>
                </th>
                <th className="py-2 pr-4">
                  <button
                    onClick={() => setSortKey("applicationsCount")}
                    className="font-medium hover:text-foreground"
                  >
                    Applications
                  </button>
                </th>
                <th className="py-2 pr-4">Hires</th>
                <th className="py-2">
                  <button onClick={() => setSortKey("signedUpAt")} className="font-medium hover:text-foreground">
                    Signed up
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-border text-foreground">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/candidates/${c.id}`} className="font-medium text-primary underline">
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground">
                    {c.disabilityCategories.map((d) => DISABILITY_LABELS[d] ?? d).join(", ") || "—"}
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{c.profileCompletionPercent}%</td>
                  <td className="py-2 pr-4 tabular-nums">{c.matchesCount}</td>
                  <td className="py-2 pr-4 tabular-nums">{c.applicationsCount}</td>
                  <td className="py-2 pr-4 tabular-nums">{c.hiresCount}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {new Date(c.signedUpAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
