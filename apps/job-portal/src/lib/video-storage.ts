import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Local-disk storage for AI interview recordings — a dev/testing-phase
// choice (free, zero new accounts). Isolated here so swapping to real object
// storage (S3/R2/etc.) before production is a one-file change, same pattern
// as the AI provider abstraction in lib/ai-interview.
const UPLOADS_ROOT = path.join(process.cwd(), "uploads", "interviews");

// interviewId/questionId are always our own cuids (never user-supplied path
// segments), but validate the shape anyway before touching the filesystem.
const SAFE_ID = /^[a-z0-9]+$/i;
function assertSafeId(id: string) {
  if (!SAFE_ID.test(id)) throw new Error(`Unsafe id for video storage: ${id}`);
}

function videoPath(interviewId: string, questionId: string): string {
  assertSafeId(interviewId);
  assertSafeId(questionId);
  return path.join(UPLOADS_ROOT, interviewId, `${questionId}.webm`);
}

// Returned value is stored on InterviewQuestion.videoUrl — a storage key,
// not a public URL. Always read back through the authenticated video route.
export async function saveInterviewVideo(
  interviewId: string,
  questionId: string,
  data: Buffer,
): Promise<string> {
  const filePath = videoPath(interviewId, questionId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
  return `${interviewId}/${questionId}.webm`;
}

export async function readInterviewVideo(interviewId: string, questionId: string): Promise<Buffer> {
  return readFile(videoPath(interviewId, questionId));
}
