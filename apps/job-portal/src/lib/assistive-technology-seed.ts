// Starter list of real, commonly-used assistive technologies, tagged with
// the AssistiveTechnologyType they belong to, so the assistive-tech search
// in profile building isn't empty before real submissions build up the
// AssistiveTechnology table — same reasoning as SEED_SKILLS in
// skill-seed.ts. Each candidate-typed "Other" entry that isn't in this list
// still gets saved via the normal upsert-by-name flow (see PUT
// /api/candidate/profile) and becomes searchable for the next candidate —
// this list is a search-time fallback, not a one-time DB seed. Not
// exhaustive; grows from real submissions from here on.
export interface SeedAssistiveTechnology {
  name: string;
  type: string;
}

export const SEED_ASSISTIVE_TECHNOLOGIES: SeedAssistiveTechnology[] = [
  // Vision aids / screen readers
  { name: "JAWS", type: "SCREEN_READER_SOFTWARE" },
  { name: "NVDA", type: "SCREEN_READER_SOFTWARE" },
  { name: "VoiceOver", type: "SCREEN_READER_SOFTWARE" },
  { name: "TalkBack", type: "SCREEN_READER_SOFTWARE" },
  { name: "Narrator", type: "SCREEN_READER_SOFTWARE" },
  { name: "White cane", type: "VISION_AID" },
  { name: "Braille display", type: "VISION_AID" },
  { name: "Braille notetaker", type: "VISION_AID" },
  { name: "Screen magnifier", type: "VISION_AID" },
  { name: "ZoomText", type: "VISION_AID" },

  // Hearing aids
  { name: "Hearing aid", type: "HEARING_AID" },
  { name: "Cochlear implant", type: "HEARING_AID" },
  { name: "FM system", type: "HEARING_AID" },
  { name: "Live captioning software", type: "HEARING_AID" },
  { name: "TTY/TDD device", type: "HEARING_AID" },
  { name: "Vibrating alert device", type: "HEARING_AID" },

  // Mobility aids
  { name: "Wheelchair", type: "MOBILITY_AID" },
  { name: "Motorized scooter", type: "MOBILITY_AID" },
  { name: "Crutches", type: "MOBILITY_AID" },
  { name: "Walker", type: "MOBILITY_AID" },
  { name: "Adapted keyboard", type: "MOBILITY_AID" },
  { name: "Voice-controlled mouse", type: "MOBILITY_AID" },
  { name: "Prosthetic limb", type: "MOBILITY_AID" },
  { name: "Grab bar / transfer aid", type: "MOBILITY_AID" },

  // Communication aids
  { name: "AAC device", type: "COMMUNICATION_AID" },
  { name: "Text-to-speech app", type: "COMMUNICATION_AID" },
  { name: "Speech-generating device", type: "COMMUNICATION_AID" },
  { name: "Communication board", type: "COMMUNICATION_AID" },

  // Other / cognitive-support software
  { name: "Task management app", type: "OTHER_SOFTWARE" },
  { name: "Focus / noise-cancelling app", type: "OTHER_SOFTWARE" },
  { name: "Reminder and calendar app", type: "OTHER_SOFTWARE" },
  { name: "Speech-to-text software", type: "OTHER_SOFTWARE" },
  { name: "Noise-cancelling headphones", type: "OTHER_SOFTWARE" },
];
