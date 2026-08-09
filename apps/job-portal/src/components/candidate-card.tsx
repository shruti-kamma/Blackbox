import Link from "next/link";
import { matchScoreColor } from "@/lib/match-score-color";
import {
  ACCOMMODATION_TYPE_OPTIONS,
  BODY_PART_OPTIONS,
  DISABILITY_CATEGORY_OPTIONS,
  PREFERRED_COMMUNICATION_MODE_OPTIONS,
} from "@/lib/matching-options";

export interface CandidateSummary {
  id: string;
  fullName: string;
  headline: string | null;
  disabilityCategories: string[];
  accessibilityNeeds: string[];
  accommodationNeeds: string[];
  confirmedNoAccommodationNeeds: boolean;
  preferredCommunicationModes: string[];
  assistiveTechnologies: { assistiveTechnology: { name: string } }[];
  disabilityDetails: { category: string; severityPercentage: number | null; affectedBodyPart: string | null }[];
  education: { level: string; fieldOfStudy: string | null; institution: string }[];
  skills: { skill: { name: string } }[];
  candidateAssessment: { status: string; score: number | null } | null;
}

const ACCOMMODATION_LABELS = Object.fromEntries(
  ACCOMMODATION_TYPE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

const COMMUNICATION_MODE_LABELS = Object.fromEntries(
  PREFERRED_COMMUNICATION_MODE_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

const DISABILITY_LABELS = Object.fromEntries(
  DISABILITY_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

const BODY_PART_LABELS = Object.fromEntries(
  BODY_PART_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

function formatDisabilityDetail(d: CandidateSummary["disabilityDetails"][number]) {
  const parts = [
    d.severityPercentage !== null ? `${d.severityPercentage}%` : null,
    d.affectedBodyPart ? BODY_PART_LABELS[d.affectedBodyPart] ?? d.affectedBodyPart : null,
  ].filter(Boolean);
  const label = DISABILITY_LABELS[d.category] ?? d.category;
  return parts.length > 0 ? `${label} — ${parts.join(", ")}` : label;
}

// `actions` renders in a right-hand rail beside the candidate's info (score,
// status, and any status controls) rather than stacked underneath — keeps
// the whole card scannable as one row instead of a tall column.
export function CandidateCard({
  candidate,
  score,
  actions,
  profileHref,
}: {
  candidate: CandidateSummary;
  score: number | null;
  actions?: React.ReactNode;
  // When provided, the candidate's name links to their full profile (e.g.
  // /employer/candidates/[id]) — omitted on pages that already are that
  // profile (like the admin candidate detail page).
  profileHref?: string;
}) {
  const color = score !== null ? matchScoreColor(score) : null;
  return (
    <div
      className={`rounded-md p-4 ${color ? "border-2" : "border border-border"}`}
      style={color ? { borderColor: color.border, backgroundColor: color.background } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link href={profileHref} className="font-medium text-primary underline">
              {candidate.fullName}
            </Link>
          ) : (
            <p className="font-medium text-foreground">{candidate.fullName}</p>
          )}
          {candidate.headline && <p className="text-sm text-muted-foreground">{candidate.headline}</p>}
          {candidate.skills.length > 0 && (
            <p className="mt-2 text-sm text-foreground">
              Skills: {candidate.skills.map((s) => s.skill.name).join(", ")}
            </p>
          )}
          {candidate.education.length > 0 && (
            <p className="text-sm text-foreground">
              Education: {candidate.education.map((e) => `${e.level} — ${e.institution}`).join(", ")}
            </p>
          )}
          {candidate.disabilityCategories.length > 0 && (
            <p className="text-sm text-foreground">Disability: {candidate.disabilityCategories.join(", ")}</p>
          )}
          {candidate.disabilityDetails.length > 0 && (
            <p className="text-sm text-foreground">
              Disability detail: {candidate.disabilityDetails.map(formatDisabilityDetail).join("; ")}
            </p>
          )}
          {candidate.assistiveTechnologies.length > 0 && (
            <p className="text-sm text-foreground">
              Assistive technology: {candidate.assistiveTechnologies.map((a) => a.assistiveTechnology.name).join(", ")}
            </p>
          )}
          {candidate.accommodationNeeds.length > 0 ? (
            <p className="text-sm text-foreground">
              Accommodations needed:{" "}
              {candidate.accommodationNeeds.map((v) => ACCOMMODATION_LABELS[v] ?? v).join(", ")}
            </p>
          ) : (
            candidate.confirmedNoAccommodationNeeds && (
              <p className="text-sm text-muted-foreground">
                Candidate has confirmed they don&apos;t require accommodations.
              </p>
            )
          )}
          {candidate.preferredCommunicationModes.length > 0 && (
            <p className="text-sm text-foreground">
              Prefers:{" "}
              {candidate.preferredCommunicationModes.map((v) => COMMUNICATION_MODE_LABELS[v] ?? v).join(", ")}
            </p>
          )}
          {candidate.accessibilityNeeds.length > 0 && (
            <p className="text-sm text-foreground">Other notes: {candidate.accessibilityNeeds.join(", ")}</p>
          )}
          <p className="mt-1 text-sm text-foreground">
            Assessment:{" "}
            {candidate.candidateAssessment?.status === "COMPLETED"
              ? `${candidate.candidateAssessment.score}%`
              : "Not yet completed"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {score !== null && (
            <span className="whitespace-nowrap text-sm font-semibold" style={{ color: color!.text }}>
              {score}% match
            </span>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
