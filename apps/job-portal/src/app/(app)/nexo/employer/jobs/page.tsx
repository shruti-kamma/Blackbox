"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@blackbox/ui";
import { apiRequest } from "@/lib/api-client";

interface JobRow {
  id: string;
  title: string;
  category: string;
  isOpen: boolean;
  createdAt: string;
  _count: { applications: number; matches: number };
}

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<JobRow[] | null>(null);

  useEffect(() => {
    apiRequest<{ jobs: JobRow[] }>("/api/jobs").then(({ jobs }) => setJobs(jobs));
  }, []);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your postings</h1>
        <Button asChild>
          <Link href="/nexo/employer/jobs/new">Post a job</Link>
        </Button>
      </div>
      {jobs === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : jobs.length === 0 ? (
        <p className="text-muted-foreground">No postings yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <li key={job.id} className="rounded-md border border-border p-4">
              <Link href={`/nexo/employer/jobs/${job.id}`} className="font-medium text-foreground hover:underline">
                {job.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {job.category} · {job._count.matches} matched candidate(s) · {job._count.applications}{" "}
                application(s) · {job.isOpen ? "Open" : "Closed"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
