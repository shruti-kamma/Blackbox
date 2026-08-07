"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface EmployerRow {
  id: string;
  name: string;
  type: string;
  jobsCount: number;
  openJobsCount: number;
  applicationsCount: number;
  hiresCount: number;
  lastActivityAt: string;
}

type SortKey = "name" | "jobsCount" | "applicationsCount" | "hiresCount" | "lastActivityAt";

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<EmployerRow[] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("lastActivityAt");

  useEffect(() => {
    apiRequest<{ employers: EmployerRow[] }>("/api/admin/employers").then(({ employers }) => setEmployers(employers));
  }, []);

  const sorted = useMemo(() => {
    if (!employers) return null;
    const copy = [...employers];
    copy.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "lastActivityAt") return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      return b[sortKey] - a[sortKey];
    });
    return copy;
  }, [employers, sortKey]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Employers</h1>
      <p className="mb-6 text-sm text-muted-foreground">Every organization on the platform.</p>

      {sorted === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-4">
                  <button onClick={() => setSortKey("name")} className="font-medium hover:text-foreground">
                    Organization
                  </button>
                </th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">
                  <button onClick={() => setSortKey("jobsCount")} className="font-medium hover:text-foreground">
                    Jobs (open)
                  </button>
                </th>
                <th className="py-2 pr-4">
                  <button onClick={() => setSortKey("applicationsCount")} className="font-medium hover:text-foreground">
                    Applications
                  </button>
                </th>
                <th className="py-2 pr-4">
                  <button onClick={() => setSortKey("hiresCount")} className="font-medium hover:text-foreground">
                    Hires
                  </button>
                </th>
                <th className="py-2">
                  <button onClick={() => setSortKey("lastActivityAt")} className="font-medium hover:text-foreground">
                    Last activity
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.id} className="border-b border-border text-foreground">
                  <td className="py-2 pr-4">
                    <Link href={`/admin/employers/${e.id}`} className="font-medium text-primary underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-muted-foreground">{e.type}</td>
                  <td className="py-2 pr-4 tabular-nums">
                    {e.jobsCount} ({e.openJobsCount})
                  </td>
                  <td className="py-2 pr-4 tabular-nums">{e.applicationsCount}</td>
                  <td className="py-2 pr-4 tabular-nums">{e.hiresCount}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {new Date(e.lastActivityAt).toLocaleDateString()}
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
