// Generates the 10 personalized skill-based MCQ questions per candidate, at
// assessment-start time — reuses the Groq chat-completions calling pattern
// from the AI interview feature this replaces, adapted to emit MCQ JSON
// (question + 4 options + correct index) instead of open-ended text, and
// scored deterministically by index comparison rather than AI-judged.
export class AssessmentGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentGenerationError";
  }
}

export interface GeneratedSkillQuestion {
  skillName: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function buildPrompt(skillNames: string[], totalCount: number): string {
  return `You are writing a multiple-choice skills assessment for a job platform. Generate exactly ${totalCount} multiple-choice questions total, testing practical working knowledge of these skills: ${skillNames.join(", ")}. Distribute the questions across the skills as evenly as possible — if there are more skills than questions, cover the most important ones.

Each question must have exactly 4 options with exactly one clearly correct answer. Questions should be clear, unambiguous, and answerable by someone with real hands-on experience in the skill — not trick questions or questions with more than one defensible answer.

Respond with a JSON object of exactly this shape, and nothing else:
{"questions": [{"skillName": "<one of the given skills, verbatim>", "prompt": "<question text>", "options": ["<option a>", "<option b>", "<option c>", "<option d>"], "correctIndex": <integer 0-3>}]}`;
}

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AssessmentGenerationError("Skill question generation isn't configured — missing GROQ_API_KEY.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AssessmentGenerationError(`Skill question generation failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new AssessmentGenerationError("Skill question generation returned an empty response.");
  }
  return text;
}

function isValidQuestion(q: unknown): q is GeneratedSkillQuestion {
  if (typeof q !== "object" || q === null) return false;
  const candidate = q as Record<string, unknown>;
  return (
    typeof candidate.skillName === "string" &&
    typeof candidate.prompt === "string" &&
    Array.isArray(candidate.options) &&
    candidate.options.length === 4 &&
    candidate.options.every((o) => typeof o === "string") &&
    typeof candidate.correctIndex === "number" &&
    Number.isInteger(candidate.correctIndex) &&
    candidate.correctIndex >= 0 &&
    candidate.correctIndex <= 3
  );
}

function validate(raw: unknown, expectedCount: number): GeneratedSkillQuestion[] {
  if (typeof raw !== "object" || raw === null || !Array.isArray((raw as Record<string, unknown>).questions)) {
    throw new AssessmentGenerationError("Malformed skill question response.");
  }
  const questions = (raw as { questions: unknown[] }).questions;
  const validated = questions.filter(isValidQuestion);
  if (validated.length < expectedCount) {
    throw new AssessmentGenerationError("Skill question generation returned too few valid questions.");
  }
  return validated.slice(0, expectedCount);
}

export async function generateSkillQuestions(skillNames: string[], count: number): Promise<GeneratedSkillQuestion[]> {
  const raw = await callGroq(buildPrompt(skillNames, count));
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AssessmentGenerationError("Skill question generation returned invalid JSON.");
  }
  return validate(parsed, count);
}
