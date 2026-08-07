// Pluggable AI backend for the interview feature — same shape as
// SkillsSimilarity in packages/matching-engine/src/skills-similarity.ts:
// swapping providers (e.g. to Anthropic at real launch) means writing a new
// implementation of this interface and changing the export in index.ts,
// without touching any route or UI code.
export interface GenerateQuestionsInput {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  candidateSkills: string[];
  candidateProjects: { title: string; techStack: string | null; description: string | null }[];
}

export interface EvaluateAnswersInput {
  jobTitle: string;
  jobDescription: string;
  qaPairs: { question: string; answer: string }[];
}

export interface EvaluateAnswersResult {
  overallScore: number;
  overallSummary: string;
  perQuestionFeedback: string[];
}

export interface ReactToAnswerInput {
  question: string;
  answer: string;
}

export interface AiInterviewProvider {
  generateQuestions(input: GenerateQuestionsInput): Promise<string[]>;
  evaluateAnswers(input: EvaluateAnswersInput): Promise<EvaluateAnswersResult>;
  // A short, in-the-moment reaction to a single answer during a live video
  // interview — separate from evaluateAnswers, which scores the whole
  // interview once at the end. Not persisted; purely conversational.
  reactToAnswer(input: ReactToAnswerInput): Promise<string>;
}

export class AiInterviewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiInterviewError";
  }
}

export const QUESTION_COUNT = 5;

// Shared prompt text so every provider implementation asks the model the
// same thing — only the transport (which API, which request/response shape)
// differs between providers.
export function buildQuestionsPrompt(input: GenerateQuestionsInput): string {
  return `You are conducting a short screening interview for a job applicant. Generate exactly ${QUESTION_COUNT} interview questions tailored to this specific candidate and role.

Job title: ${input.jobTitle}
Job description: ${input.jobDescription}
Required skills: ${input.requiredSkills.join(", ") || "none specified"}

Candidate's listed skills: ${input.candidateSkills.join(", ") || "none listed"}
Candidate's projects:
${input.candidateProjects.map((p) => `- ${p.title}${p.techStack ? ` (${p.techStack})` : ""}${p.description ? `: ${p.description}` : ""}`).join("\n") || "none listed"}

Ask questions that probe the candidate's actual depth in their listed skills and projects, plus general fit for the role's requirements — the way a real technical screening interview would. Avoid yes/no questions.

Respond with ONLY a JSON array of ${QUESTION_COUNT} question strings, nothing else. Example: ["question one", "question two", ...]`;
}

export function buildEvaluationPrompt(input: EvaluateAnswersInput): string {
  return `You are evaluating a candidate's answers from a screening interview for this role.

Job title: ${input.jobTitle}
Job description: ${input.jobDescription}

Questions and answers:
${input.qaPairs.map((qa, i) => `${i + 1}. Q: ${qa.question}\n   A: ${qa.answer || "(no answer given)"}`).join("\n")}

Evaluate the depth, accuracy, and relevance of each answer. Respond with ONLY a JSON object of this exact shape, nothing else:
{
  "overallScore": <integer 0-100>,
  "overallSummary": "<2-3 sentence summary for the hiring manager>",
  "perQuestionFeedback": ["<one short feedback line per question, in order>"]
}`;
}

export function buildReactionPrompt(input: ReactToAnswerInput): string {
  return `You're an interviewer conducting a live video screening interview. You just asked the candidate this question and they answered out loud:

Question: ${input.question}
Answer: ${input.answer || "(no answer given)"}

Give a short, natural, in-the-moment spoken reaction — one or two sentences, the way a real interviewer would respond before moving to the next question. If the answer is strong, acknowledge what's good about it specifically. If it's weak or off-topic, respond neutrally and professionally, not harshly. You may briefly reference something specific they said. Do not ask a new question — just react, since the next question comes separately.

Respond with ONLY the reaction text, nothing else — no quotes, no labels, no JSON.`;
}

export function parseAiJson<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AiInterviewError("Couldn't process the AI's response — please try again.");
  }
}

export function validateQuestions(questions: unknown): string[] {
  if (!Array.isArray(questions) || questions.length === 0 || !questions.every((q) => typeof q === "string")) {
    throw new AiInterviewError("AI interview didn't return usable questions — please try again.");
  }
  return questions;
}

export function validateEvaluation(result: Partial<EvaluateAnswersResult>): EvaluateAnswersResult {
  if (
    typeof result.overallScore !== "number" ||
    typeof result.overallSummary !== "string" ||
    !Array.isArray(result.perQuestionFeedback)
  ) {
    throw new AiInterviewError("AI interview didn't return a usable evaluation — please try again.");
  }
  return {
    overallScore: Math.max(0, Math.min(100, Math.round(result.overallScore))),
    overallSummary: result.overallSummary,
    perQuestionFeedback: result.perQuestionFeedback,
  };
}
