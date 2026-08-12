import Image from "next/image";
import { cn } from "@blackbox/ui";

// Muted, WCAG-safe hues distinct from the score-signal palette (good/mid/poor)
// so the two color systems never get visually confused.
const PALETTE = [
  "#1C3D5A", // ink blue (brand)
  "#4B4237", // warm charcoal
  "#3C5A45", // deep green
  "#5A3C4A", // plum
  "#5A4A2E", // ochre-brown
  "#2E4A5A", // slate blue
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0] + words[1]![0]).toUpperCase();
}

export interface OrgAvatarProps {
  name: string;
  logoUrl: string | null;
  size?: "sm" | "lg";
  className?: string;
}

// Decorative — always render alongside the org's visible name text, never
// as a standalone control, so aria-hidden here doesn't drop information.
// Shared by module-leaderboards and module-org-snapshot (see docs/decisions.md
// — "Rankings feature modules"): lives here since the leaderboard is where
// it's first needed, org-snapshot depends on this package for it.
export function OrgAvatar({ name, logoUrl, size = "sm", className }: OrgAvatarProps) {
  const dimension = size === "lg" ? 96 : 40;

  if (logoUrl) {
    return (
      <span
        className={cn(
          "relative inline-block shrink-0 overflow-hidden rounded-full border border-border bg-muted",
          className,
        )}
        style={{ width: dimension, height: dimension }}
      >
        <Image src={logoUrl} alt="" fill sizes={`${dimension}px`} className="object-contain p-1" />
      </span>
    );
  }

  const color = PALETTE[hashString(name) % PALETTE.length];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-serif font-semibold text-white",
        size === "lg" ? "text-2xl" : "text-sm",
        className,
      )}
      style={{ width: dimension, height: dimension, backgroundColor: color }}
    >
      {initials(name)}
    </span>
  );
}
