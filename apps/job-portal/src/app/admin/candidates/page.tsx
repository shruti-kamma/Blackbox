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
  kycVerified: boolean;
  assessmentScore: number | null;
}

type SortKey = "fullName" | "profileCompletionPercent" | "matchesCount" | "applicationsCount" | "signedUpAt";

export default function AdminCandidatesPage() {
  const [candidates, setCandidates] = useState<CandidateRow[] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("signedUpAt");
  const [search, setSearch] = useState("");
  const [disabilityFilter, setDisabilityFilter] = useState("");

  useEffect(() => {
    apiRequest<{ candidates: CandidateRow[] }>("/api/admin/candidates").then(({ candidates }) =>
      setCandidates(candidates),
    );
  }, []);

  const sorted = useMemo(() => {
    if (!candidates) return null;
    const query = search.trim().toLowerCase();
    const filtered = candidates.filter((c) => {
      const matchesQuery =
        query === "" ||
        c.fullName.toLowerCase().includes(query) ||
        c.disabilityCategories.some((d) => (DISABILITY_LABELS[d] ?? d).toLowerCase().includes(query));
      const matchesCategory = disabilityFilter === "" || c.disabilityCategories.includes(disabilityFilter);
      return matchesQuery && matchesCategory;
    });
    filtered.sort((a, b) => {
      if (sortKey === "fullName") return a.fullName.localeCompare(b.fullName);
      if (sortKey === "signedUpAt") return new Date(b.signedUpAt).getTime() - new Date(a.signedUpAt).getTime();
      return b[sortKey] - a[sortKey];
    });
    return filtered;
  }, [candidates, sortKey, search, disabilityFilter]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Candidates</h1>
      <p className="mb-6 text-sm text-muted-foreground">Every candidate on the platform.</p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or disability…"
          aria-label="Search candidates"
          className="h-touch-target min-w-[220px] flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
        <select
          value={disabilityFilter}
          onChange={(e) => setDisabilityFilter(e.target.value)}
          aria-label="Filter by disability category"
          className="h-touch-target rounded-md border border-border bg-background px-3 text-sm text-foreground"
        >
          <option value="">All disability categories</option>
          {DISABILITY_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {candidates && (
        <p className="mb-3 text-xs text-muted-foreground">
          Showing {sorted?.length ?? 0} of {candidates.length} candidates
        </p>
      )}

      {sorted === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">No candidates match your search.</p>
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
                <th className="py-2 pr-4">KYC</th>
                <th className="py-2 pr-4">Assessment</th>
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
                  <td className="py-2 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.kycVerified ? "bg-muted text-foreground" : "bg-danger/10 text-danger"
                      }`}
                    >
                      {c.kycVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="py-2 pr-4 tabular-nums">
                    {c.assessmentScore !== null ? `${c.assessmentScore}%` : "—"}
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
