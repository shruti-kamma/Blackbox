import { Lexend } from "next/font/google";
import { SkipLink } from "@blackbox/ui";
import { RANKING_ROOT_ID } from "@/lib/ranking-theme";
import "./ranking-theme.css";

// The theme-init script that targets this id runs from the root layout
// (app/layout.tsx), not here — see lib/ranking-theme.ts for why.

// Single font for the /ranking section (headings and body both map to
// this) — ported from apps/rankings, applied here to the section wrapper
// rather than <html> so the rest of job-portal keeps its own Geist font.
const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id={RANKING_ROOT_ID}
      className={`${lexend.variable} flex flex-1 flex-col`}
      // data-theme is set by the root layout's blocking init script before
      // React hydrates — the server render never has it, so this specific,
      // expected mismatch needs to be suppressed rather than "fixed".
      suppressHydrationWarning
    >
      <SkipLink href="#main-content" />
      {children}
    </div>
  );
}
