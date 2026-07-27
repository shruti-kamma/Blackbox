// A match score is a continuum, not a pass/fail — the color should read that
// way too: green at a strong fit, sliding through amber toward red as the
// fit weakens. Hue interpolates 0 (red) -> 130 (green); saturation/lightness
// stay fixed so the ramp reads consistently across scores.
export function matchScoreColor(score: number) {
  const clamped = Math.max(0, Math.min(100, score));
  const hue = (clamped / 100) * 130;
  return {
    border: `hsl(${hue} 65% 40%)`,
    text: `hsl(${hue} 70% 32%)`,
    background: `hsl(${hue} 70% 45% / 0.08)`,
  };
}
