"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { ApplicationStatusBadge } from "@/components/application-status";
import type { ApplicationStatus } from "@/lib/application-status";

interface OrgDetail {
  organization: { id: string; name: string; type: string; website: string | null; createdAt: string };
  jobs: { id: string; title: string; isOpen: boolean; createdAt: string; applicationsCount: number; hiresCount: number }[];
  applications: {
    id: string;
    status: ApplicationStatus;
    matchScore: number | null;
    createdAt: string;
    candidateId: string;
    candidateName: string;
    jobTitle: string;
  }[];
}

export default function AdminEmployerDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [data, setData] = useState<OrgDetail | null>(null);

  useEffect(() => {
    apiRequest<OrgDetail>(`/api/admin/employers/${orgId}`).then(setData);
  }, [orgId]);

  if (data === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <p className="mb-1 text-xs text-muted-foreground">{data.organization.type}</p>
      <h1 className="mb-2 text-2xl font-semibold text-foreground">{data.organization.name}</h1>
      {data.organization.website && (
        <a href={data.organization.website} className="text-sm text-primary underline" target="_blank" rel="noreferrer">
          {data.organization.website}
        </a>
      )}
      <p className="mb-8 mt-1 text-xs text-muted-foreground">
        On the platform since {new Date(data.organization.createdAt).toLocaleDateString()}
      </p>

      <div className="mb-10">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Jobs ({data.jobs.length})</h2>
        {data.jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jobs posted yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.jobs.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
              >
                <div>
                  <span className="font-medium">{j.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    Posted {new Date(j.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{j.applicationsCount} applications</span>
                  <span>{j.hiresCount} hires</span>
                  <span className={j.isOpen ? "text-success" : ""}>{j.isOpen ? "Open" : "Closed"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">Applications ({data.applications.length})</h2>
        {data.applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.applications.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border p-3 text-sm text-foreground"
              >
                <div>
                  <Link href={`/admin/candidates/${a.candidateId}`} className="font-medium text-primary underline">
                    {a.candidateName}
                  </Link>{" "}
                  — {a.jobTitle}
                  {a.matchScore !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">{a.matchScore}% match</span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <ApplicationStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
