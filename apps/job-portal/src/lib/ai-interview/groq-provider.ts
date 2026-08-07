import {
  AiInterviewError,
  buildEvaluationPrompt,
  buildQuestionsPrompt,
  buildReactionPrompt,
  parseAiJson,
  validateEvaluation,
  validateQuestions,
  type AiInterviewProvider,
  type EvaluateAnswersInput,
  type EvaluateAnswersResult,
  type GenerateQuestionsInput,
  type ReactToAnswerInput,
} from "./provider";

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_WHISPER_MODEL = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo";

async function callGroq(prompt: string, jsonMode = true): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AiInterviewError("AI interview isn't configured yet — missing GROQ_API_KEY.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AiInterviewError(`AI interview request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new AiInterviewError("AI interview response was empty or malformed.");
  }
  return text;
}

// Not part of AiInterviewProvider — only the currently-active provider needs
// speech-to-text (Gemini's provider has no equivalent yet), so this is its
// own standalone export rather than a required interface method.
export async function transcribeAudioWithGroq(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AiInterviewError("AI interview isn't configured yet — missing GROQ_API_KEY.");
  }

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(audioBuffer)], { type: mimeType }), "answer.webm");
  form.append("model", GROQ_WHISPER_MODEL);

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AiInterviewError(`Transcription request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  if (typeof data.text !== "string") {
    throw new AiInterviewError("Transcription response was empty or malformed.");
  }
  return data.text.trim();
}

export const groqInterviewProvider: AiInterviewProvider = {
  async generateQuestions(input: GenerateQuestionsInput): Promise<string[]> {
    // Groq's json_object mode requires a top-level object, not a bare array
    // — ask for { questions: [...] } and unwrap, unlike Gemini's provider
    // which can return a raw array directly.
    const raw = await callGroq(
      `${buildQuestionsPrompt(input)}\n\nRespond with a JSON OBJECT of the shape {"questions": [...]} instead of a bare array.`,
    );
    const parsed = parseAiJson<{ questions?: unknown }>(raw);
    return validateQuestions(parsed.questions);
  },

  async evaluateAnswers(input: EvaluateAnswersInput): Promise<EvaluateAnswersResult> {
    const raw = await callGroq(buildEvaluationPrompt(input));
    return validateEvaluation(parseAiJson(raw));
  },

  async reactToAnswer(input: ReactToAnswerInput): Promise<string> {
    const raw = await callGroq(buildReactionPrompt(input), false);
    return raw.trim();
  },
};
