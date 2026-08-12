// pdf-parse@1, deliberately not the v2 rewrite — v2 is built on pdfjs-dist's
// worker machinery, which fails to resolve its worker chunk under Turbopack
// in a plain Node route handler (confirmed while building this: "Setting up
// fake worker failed"). v1's simple synchronous-in-process API has no such
// dependency and is exactly what a server route needs.
//
// Importing the package's own entry (`pdf-parse`) is deliberately avoided
// too: its index.js has a debug-mode branch gated on `!module.parent` that
// misfires under Turbopack's module system, making it try to read a sample
// PDF fixture that only exists in the package's own repo and crashing the
// route on load (confirmed: "ENOENT ... ./test/data/05-versions-space.pdf").
// Importing the inner lib file skips that branch entirely — see
// pdf-parse-lib.d.ts for the accompanying type shim this subpath needs.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { extractRawText } from "mammoth";
import { ResumeParsingError } from "./extract-fields";

export class UnsupportedResumeFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedResumeFormatError";
  }
}

// Autofill parsing only reasonably supports PDF and DOCX — legacy .doc's
// binary format has no reliable pure-JS text extraction. Plain storage (the
// resume-upload route) still accepts .doc, this is a narrower restriction
// specific to parsing.
export async function extractResumeText(bytes: Buffer, extension: string): Promise<string> {
  if (extension === "pdf") {
    // pdf-parse's bundled pdf.js is old and not every real-world PDF
    // structure parses cleanly (confirmed while building this: a
    // ReportLab-generated test file threw "bad XRef entry" even though it's
    // a valid PDF) — surface that as a friendly, actionable message rather
    // than a raw 500.
    try {
      const result = await pdfParse(bytes);
      return result.text;
    } catch {
      throw new ResumeParsingError(
        "Couldn't read that PDF — it may be scanned/image-based or use an unusual format. Try a different file, or enter your details manually.",
      );
    }
  }

  if (extension === "docx") {
    try {
      const result = await extractRawText({ buffer: bytes });
      return result.value;
    } catch {
      throw new ResumeParsingError(
        "Couldn't read that file. Try a different file, or enter your details manually.",
      );
    }
  }

  throw new UnsupportedResumeFormatError(
    "Autofill only works with PDF or DOCX files — a .doc file was uploaded. Try re-saving it as PDF, or enter your details manually.",
  );
}
