import Link from "next/link";
import { Button } from "@blackbox/ui";
import { computeProfileCompletion, type ProfileCompletionInput } from "@/lib/profile-completion";
import { matchScoreColor } from "@/lib/match-score-color";

interface CandidateProfileCardProps {
  profile: ProfileCompletionInput & {
    fullName: string;
    updatedAt: string;
    education: { level: string; fieldOfStudy: string | null; institution: string }[];
  };
  matchCount: number;
  employerActionCount: number;
}

function initials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(iso: string) {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mo ago`;
  return `${Math.floor(diffMonths / 12)} yr ago`;
}

function CompletionRing({ percent, children }: { percent: number; children: React.ReactNode }) {
  const size = 96;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = matchScoreColor(percent);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.border}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
        />
      </svg>
      <div
        className="flex items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground"
        style={{ width: size - stroke * 4, height: size - stroke * 4 }}
      >
        {children}
      </div>
    </div>
  );
}

export function CandidateProfileCard({ profile, matchCount, employerActionCount }: CandidateProfileCardProps) {
  const { percent } = computeProfileCompletion(profile);
  const topEducation = profile.education[0];

  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-border p-6 text-center">
      <CompletionRing percent={percent}>{initials(profile.fullName)}</CompletionRing>
      <p className="text-sm font-semibold" style={{ color: matchScoreColor(percent).text }}>
        {percent}%
      </p>

      <div>
        <p className="font-medium text-foreground">{profile.fullName}</p>
        {topEducation && (
          <p className="text-sm text-muted-foreground">
            {topEducation.level.replace("_", " ")}
            {topEducation.fieldOfStudy ? ` / ${topEducation.fieldOfStudy}` : ""}
          </p>
        )}
        {topEducation && <p className="text-sm text-muted-foreground">@ {topEducation.institution}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Last updated {relativeTime(profile.updatedAt)}</p>
      </div>

      <Button asChild size="sm" className="w-full">
        <Link href="/candidate/profile">{percent === 100 ? "Edit profile" : "Complete profile"}</Link>
      </Button>

      <div className="mt-2 w-full rounded-md bg-muted p-4 text-left">
        <p className="mb-3 text-sm font-medium text-foreground">Profile performance</p>
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xl font-semibold tabular-nums text-foreground">{matchCount}</p>
            <p className="text-xs text-muted-foreground">Employer matches</p>
          </div>
          <div>
            <p className="text-xl font-semibold tabular-nums text-foreground">{employerActionCount}</p>
            <p className="text-xs text-muted-foreground">Employer actions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
