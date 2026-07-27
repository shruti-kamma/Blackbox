import path from "node:path";
import type { NextConfig } from "next";

// Without this, Next.js mis-detects the workspace root (there's a stray
// lockfile up in the user's home directory) and prints a warning, plus
// Turbopack scans further than it needs to. `__dirname` isn't reliable in
// next.config.ts's loader context, so resolve from cwd (this file only
// ever loads with job-portal as the working directory, via `next dev`/
// `next build`).
const monorepoRoot = path.resolve(process.cwd(), "../..");

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
};

export default nextConfig;
