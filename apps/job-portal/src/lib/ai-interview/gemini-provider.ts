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

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function callGemini(prompt: string, jsonMode = true): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiInterviewError("AI interview isn't configured yet — missing GEMINI_API_KEY.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        ...(jsonMode ? { generationConfig: { responseMimeType: "application/json" } } : {}),
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AiInterviewError(`AI interview request failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new AiInterviewError("AI interview response was empty or malformed.");
  }
  return text;
}

export const geminiInterviewProvider: AiInterviewProvider = {
  async generateQuestions(input: GenerateQuestionsInput): Promise<string[]> {
    const raw = await callGemini(buildQuestionsPrompt(input));
    return validateQuestions(parseAiJson(raw));
  },

  async evaluateAnswers(input: EvaluateAnswersInput): Promise<EvaluateAnswersResult> {
    const raw = await callGemini(buildEvaluationPrompt(input));
    return validateEvaluation(parseAiJson(raw));
  },

  async reactToAnswer(input: ReactToAnswerInput): Promise<string> {
    const raw = await callGemini(buildReactionPrompt(input), false);
    return raw.trim();
  },
};
