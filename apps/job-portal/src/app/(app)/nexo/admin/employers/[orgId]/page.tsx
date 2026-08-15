"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { ApplicationStatusBadge } from "@/components/application-status";
import type { ApplicationStatus } from "@/lib/application-status";

interface OrgDetail {
  organization: { id: string; name: string; type: string; website: string | null; createdAt: string };
  hrTraining: { userId: string; email: string; trained: boolean | null; notes: string | null }[];
  jobs: {
    id: string;
    title: string;
    isOpen: boolean;
    createdAt: string;
    offersGuaranteedInterview: boolean;
    applicationsCount: number;
    hiresCount: number;
  }[];
  applications: {
    id: string;
    status: ApplicationStatus;
    matchScore: number | null;
    createdAt: string;
    metEssentialCriteria: boolean;
    candidateId: string;
    candidateName: string;
    jobTitle: string;
  }[];
  reviews: {
    id: string;
    honoredAccommodations: boolean | null;
    accessibleProcess: boolean;
    comment: string | null;
    createdAt: string;
    candidateId: string;
    candidateName: string;
  }[];
}

export default function AdminEmployerDetailPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [data, setData] = useState<OrgDetail | null>(null);

  useEffect(() => {
    apiRequest<OrgDetail>(`/api/admin/employers/${orgId}`).then(setData);
  }, [orgId]);

  async function deleteReview(reviewId: string) {
    if (!confirm("Remove this review? This can't be undone.")) return;
    await apiRequest(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
    setData((d) => (d ? { ...d, reviews: d.reviews.filter((r) => r.id !== reviewId) } : d));
  }

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
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">{data.organization.name}</h1>
      {data.organization.website && (
        <a href={data.organization.website} className="text-sm text-primary underline" target="_blank" rel="noreferrer">
          {data.organization.website}
        </a>
      )}
      <p className="mb-8 mt-1 text-xs text-muted-foreground">
        On the platform since {new Date(data.organization.createdAt).toLocaleDateString()}
      </p>

      <div className="mb-10">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          HR training ({data.hrTraining.length} {data.hrTraining.length === 1 ? "account" : "accounts"})
        </h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Self-reported at sign-up, internal only — never shown to candidates.
        </p>
        {data.hrTraining.length === 0 ? (
          <p className="text-sm text-muted-foreground">No employer accounts yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.hrTraining.map((u) => (
              <li key={u.userId} className="rounded-md border border-border p-3 text-sm text-foreground">
                <span className="font-medium">{u.email}</span> —{" "}
                <span
                  className={u.trained === true ? "text-success" : u.trained === false ? "text-danger" : "text-muted-foreground"}
                >
                  {u.trained === true ? "Trained" : u.trained === false ? "Not trained" : "Not answered"}
                </span>
                {u.notes && <p className="mt-1 text-xs text-muted-foreground">&ldquo;{u.notes}&rdquo;</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

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
                  {j.offersGuaranteedInterview && (
                    <span className="ml-2 text-xs font-medium text-success">Guaranteed interview</span>
                  )}
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
                  <Link href={`/nexo/admin/candidates/${a.candidateId}`} className="font-medium text-primary underline">
                    {a.candidateName}
                  </Link>{" "}
                  — {a.jobTitle}
                  {a.matchScore !== null && (
                    <span className="ml-2 text-xs text-muted-foreground">{a.matchScore}% match</span>
                  )}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  {a.metEssentialCriteria && (
                    <span className="ml-2 text-xs font-medium text-success">Meets must-haves</span>
                  )}
                </div>
                <ApplicationStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Disability-inclusion reviews ({data.reviews.length})
        </h2>
        <p className="mb-2 text-xs text-muted-foreground">
          Shown to candidates anonymized (no name) — visible here with identity for moderation.
        </p>
        {data.reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.reviews.map((r) => (
              <li key={r.id} className="rounded-md border border-border p-3 text-sm text-foreground">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/nexo/admin/candidates/${r.candidateId}`} className="font-medium text-primary underline">
                      {r.candidateName}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Accommodations honored:{" "}
                      <span
                        className={
                          r.honoredAccommodations === true
                            ? "text-success"
                            : r.honoredAccommodations === false
                              ? "text-danger"
                              : ""
                        }
                      >
                        {r.honoredAccommodations === true
                          ? "Yes"
                          : r.honoredAccommodations === false
                            ? "No"
                            : "Didn't request any"}
                      </span>
                      {" · "}
                      Accessible process:{" "}
                      <span className={r.accessibleProcess ? "text-success" : "text-danger"}>
                        {r.accessibleProcess ? "Yes" : "No"}
                      </span>
                    </p>
                    {r.comment && <p className="mt-1 text-foreground">&ldquo;{r.comment}&rdquo;</p>}
                  </div>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="shrink-0 text-xs font-medium text-danger underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
