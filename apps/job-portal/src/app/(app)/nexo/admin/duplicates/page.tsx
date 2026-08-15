"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface FlagRow {
  id: string;
  reason: string;
  createdAt: string;
  candidate: { id: string; fullName: string; email: string };
  suspectedDuplicateOf: { id: string; fullName: string; email: string };
}

// Minimal, table-driven review queue for soft duplicate-account signals —
// same shape as the existing admin candidates list, no new UI paradigm.
// Never auto-acted on; resolving a flag here has no further automated
// effect, it's purely a record of the decision.
export default function AdminDuplicatesPage() {
  const [flags, setFlags] = useState<FlagRow[] | null>(null);

  function load() {
    apiRequest<{ flags: FlagRow[] }>("/api/admin/duplicates").then(({ flags }) => setFlags(flags));
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(flagId: string, status: "DISMISSED" | "CONFIRMED_DUPLICATE") {
    await apiRequest(`/api/admin/duplicates/${flagId}`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">Duplicate account flags</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Soft signals only — nothing here is auto-blocked. Today the only source is a matching disability-certificate
        number between two accounts.
      </p>

      {flags === null ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : flags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open flags.</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4">Candidate</th>
              <th className="py-2 pr-4">Suspected duplicate of</th>
              <th className="py-2 pr-4">Reason</th>
              <th className="py-2 pr-4">Flagged</th>
              <th className="py-2 pr-4">Resolve</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.id} className="border-b border-border text-foreground">
                <td className="py-2 pr-4">
                  <Link href={`/nexo/admin/candidates/${f.candidate.id}`} className="font-medium text-primary underline">
                    {f.candidate.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{f.candidate.email}</p>
                </td>
                <td className="py-2 pr-4">
                  <Link
                    href={`/nexo/admin/candidates/${f.suspectedDuplicateOf.id}`}
                    className="font-medium text-primary underline"
                  >
                    {f.suspectedDuplicateOf.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{f.suspectedDuplicateOf.email}</p>
                </td>
                <td className="py-2 pr-4 text-xs text-muted-foreground">{f.reason}</td>
                <td className="py-2 pr-4 text-xs text-muted-foreground">
                  {new Date(f.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 pr-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => resolve(f.id, "CONFIRMED_DUPLICATE")}
                      className="text-xs font-medium text-danger underline"
                    >
                      Confirm duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => resolve(f.id, "DISMISSED")}
                      className="text-xs font-medium text-muted-foreground underline"
                    >
                      Dismiss
                    </button>
                  </div>
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
