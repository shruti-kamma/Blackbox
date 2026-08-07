import { groqInterviewProvider, transcribeAudioWithGroq } from "./groq-provider";
import type { AiInterviewProvider } from "./provider";

// Using Groq for now — free tier, no billing account required, good for
// testing. geminiInterviewProvider (./gemini-provider.ts) is a working
// alternative left in place; an Anthropic-backed one is the plan for real
// launch. Swapping any of these in is: write/point to an implementation of
// AiInterviewProvider, change this one line. No route or UI code changes.
export const aiInterviewProvider: AiInterviewProvider = groqInterviewProvider;

// Speech-to-text for video-mode answers — same swap story as above.
export const transcribeAudio = transcribeAudioWithGroq;

export { AiInterviewError } from "./provider";
