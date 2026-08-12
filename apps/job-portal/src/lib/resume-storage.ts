import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// Local-disk storage, dev-appropriate — no cloud provider is configured
// anywhere in this project yet (see .env.example). One file per candidate,
// named by their profile id so a re-upload naturally replaces the old one
// with no orphaned files to clean up.
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");

export const ALLOWED_RESUME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5MB

function resumePath(candidateProfileId: string, extension: string): string {
  // candidateProfileId is a cuid (alphanumeric only) — safe to interpolate
  // directly into a filename with no risk of path traversal.
  return path.join(UPLOAD_DIR, `${candidateProfileId}.${extension}`);
}

export async function saveResumeFile(
  candidateProfileId: string,
  extension: string,
  bytes: Buffer,
): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  // A re-upload with a different file type shouldn't leave the old file
  // behind under its old extension.
  for (const ext of Object.values(ALLOWED_RESUME_TYPES)) {
    if (ext !== extension) await rm(resumePath(candidateProfileId, ext), { force: true });
  }
  await writeFile(resumePath(candidateProfileId, extension), bytes);
}

export async function readResumeFile(candidateProfileId: string, extension: string): Promise<Buffer> {
  return readFile(resumePath(candidateProfileId, extension));
}

export async function deleteResumeFile(candidateProfileId: string, extension: string): Promise<void> {
  await rm(resumePath(candidateProfileId, extension), { force: true });
}
