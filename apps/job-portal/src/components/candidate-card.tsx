import { matchScoreColor } from "@/lib/match-score-color";

export interface CandidateSummary {
  id: string;
  fullName: string;
  headline: string | null;
  disabilityCategories: string[];
  accessibilityNeeds: string[];
  education: { level: string; fieldOfStudy: string | null; institution: string }[];
  skills: { skill: { name: string } }[];
}

// `actions` renders in a right-hand rail beside the candidate's info (score,
// status, and any status controls) rather than stacked underneath — keeps
// the whole card scannable as one row instead of a tall column.
export function CandidateCard({
  candidate,
  score,
  actions,
}: {
  candidate: CandidateSummary;
  score: number | null;
  actions?: React.ReactNode;
}) {
  const color = score !== null ? matchScoreColor(score) : null;
  return (
    <div
      className={`rounded-md p-4 ${color ? "border-2" : "border border-border"}`}
      style={color ? { borderColor: color.border, backgroundColor: color.background } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{candidate.fullName}</p>
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
          {candidate.accessibilityNeeds.length > 0 && (
            <p className="text-sm text-foreground">
              Accommodations needed: {candidate.accessibilityNeeds.join(", ")}
            </p>
          )}
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
