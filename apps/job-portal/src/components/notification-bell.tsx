"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { ACCOMMODATION_TYPE_OPTIONS } from "@/lib/matching-options";

interface Notification {
  id: string;
  type: string;
  payload: {
    jobId?: string;
    score?: number;
    candidateName?: string;
    missingAccommodations?: string[];
  };
  read: boolean;
  createdAt: string;
}

const ACCOMMODATION_LABELS = Object.fromEntries(
  ACCOMMODATION_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

function NotificationContent({ n }: { n: Notification }) {
  if (n.type === "ACCOMMODATION_GAP") {
    const labels = (n.payload.missingAccommodations ?? []).map((v) => ACCOMMODATION_LABELS[v] ?? v);
    return (
      <>
        <strong>{n.payload.candidateName}</strong> needs: {labels.join(", ")} — not yet marked as offered on
        this job.{" "}
        {n.payload.jobId && (
          <Link href={`/nexo/employer/jobs/${n.payload.jobId}`} className="text-primary underline">
            View
          </Link>
        )}
      </>
    );
  }
  if (n.type === "GUARANTEED_INTERVIEW_SKIPPED") {
    return (
      <>
        <strong>{n.payload.candidateName}</strong> met your must-have skills for this job but was rejected
        before an interview — your guaranteed-interview commitment applied here.{" "}
        {n.payload.jobId && (
          <Link href={`/nexo/employer/jobs/${n.payload.jobId}`} className="text-primary underline">
            View
          </Link>
        )}
      </>
    );
  }
  return (
    <>
      New match — {n.payload.score}% fit.{" "}
      {n.payload.jobId && (
        <Link href="/nexo/candidate/jobs" className="text-primary underline">
          View
        </Link>
      )}
    </>
  );
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiRequest<{ notifications: Notification[] }>("/api/notifications")
      .then(({ notifications }) => setNotifications(notifications))
      .catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length === 0) return;
    await apiRequest("/api/notifications", { method: "PATCH", body: JSON.stringify({ ids: unread }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative flex h-touch-target w-touch-target items-center justify-center rounded-md hover:bg-muted"
      >
        <span aria-hidden>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] text-danger-foreground">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-72 rounded-md border border-border bg-background p-2 shadow-lg">
          {notifications.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {notifications.map((n) => (
                <li key={n.id} className="rounded-md p-2 text-sm text-foreground hover:bg-muted">
                  <NotificationContent n={n} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
