// Reads a disability certificate/UDID card photo and extracts the fields
// needed to check it against a candidate's profile. Uses the Anthropic
// Messages API directly, not the Groq pattern used elsewhere in this repo
// (lib/assessment/skill-question-generator.ts) — this project's Groq
// account/tier has no vision-capable model available (confirmed directly
// against the real API: every vision-model name tried returned
// model_not_found, and the account's own /models list has none). A real
// ANTHROPIC_API_KEY already exists in this project (services/scoring-agent,
// services/matching-agent), reused here rather than adding a new provider.
//
// This is a *document consistency check*, not real government
// verification — no public API exists to verify a UDID number against the
// actual registry (confirmed by research, not assumed). It confirms the
// certificate's stated category matches what the candidate selected and
// looks like a genuine document; a competently forged certificate could
// still defeat it. Described to the client as exactly that.
//
// The image itself is never written to disk anywhere in this codebase —
// the caller (the API route) passes bytes straight from the upload
// request into this function and discards them immediately after.
export class CertificateExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CertificateExtractionError";
  }
}

// Matches the DisabilityCategory enum in schema.prisma. Asking the model to
// classify directly into these values (rather than extracting raw
// certificate text and mapping it ourselves afterward) offloads the
// certificate-wording-to-category mapping to the model, which is more
// robust to the real variation in how certificates phrase things than a
// hand-authored keyword list would be.
const DISABILITY_CATEGORY_VALUES = [
  "VISUAL",
  "HEARING",
  "MOBILITY",
  "COGNITIVE",
  "SPEECH",
  "CHRONIC_ILLNESS",
  "MENTAL_HEALTH",
  "OTHER",
] as const;

export interface ExtractedCertificateFields {
  looksLikeGenuineCertificate: boolean;
  name: string | null;
  category: (typeof DISABILITY_CATEGORY_VALUES)[number] | null;
  certificateNumber: string | null;
}

const CLAUDE_VISION_MODEL = process.env.CLAUDE_VISION_MODEL || "claude-sonnet-5";

const PROMPT = `You are looking at a photo of what should be an Indian disability certificate or Unique Disability ID (UDID) card. Extract the following and respond with ONLY a JSON object of exactly this shape, and nothing else — no markdown, no code fences, no explanation:

{"looksLikeGenuineCertificate": <true if this genuinely looks like an official disability certificate or UDID card, false if it's unreadable, clearly unrelated, or obviously not this kind of document>, "name": <the certificate holder's full name as printed, or null if not legible>, "category": <one of ${DISABILITY_CATEGORY_VALUES.join(
  ", ",
)} — pick whichever best matches the disability category stated on the certificate, or null if unclear>, "certificateNumber": <the certificate or UDID number as printed, or null if not legible>}`;

function parseDataUri(dataUri: string): { mediaType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUri);
  if (!match) {
    throw new CertificateExtractionError("Malformed image data.");
  }
  return { mediaType: match[1], base64: match[2] };
}

async function callClaudeVision(base64DataUri: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new CertificateExtractionError("Certificate verification isn't configured — missing ANTHROPIC_API_KEY.");
  }
  const { mediaType, base64 } = parseDataUri(base64DataUri);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_VISION_MODEL,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new CertificateExtractionError(`Certificate extraction failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new CertificateExtractionError("Certificate extraction returned an empty response.");
  }
  return text;
}

function isValidCategory(value: unknown): value is (typeof DISABILITY_CATEGORY_VALUES)[number] {
  return typeof value === "string" && (DISABILITY_CATEGORY_VALUES as readonly string[]).includes(value);
}

function validate(raw: unknown): ExtractedCertificateFields {
  if (typeof raw !== "object" || raw === null) {
    throw new CertificateExtractionError("Malformed certificate extraction response.");
  }
  const r = raw as Record<string, unknown>;
  return {
    looksLikeGenuineCertificate: r.looksLikeGenuineCertificate === true,
    name: typeof r.name === "string" ? r.name : null,
    category: isValidCategory(r.category) ? r.category : null,
    certificateNumber: typeof r.certificateNumber === "string" ? r.certificateNumber : null,
  };
}

export async function extractCertificateFields(base64DataUri: string): Promise<ExtractedCertificateFields> {
  const raw = await callClaudeVision(base64DataUri);
  // Claude is instructed to respond with bare JSON, but strip a markdown
  // code fence defensively in case it wraps the response in one anyway.
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new CertificateExtractionError("Certificate extraction returned invalid JSON.");
  }
  return validate(parsed);
}
