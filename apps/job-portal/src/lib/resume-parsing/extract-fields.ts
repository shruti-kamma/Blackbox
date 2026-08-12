// Extracts structured profile fields from raw resume text via Groq — same
// chat-completions calling pattern as skill-question-generator.ts. Only
// ever returns fields the candidate must still review and explicitly Save;
// nothing here writes to the database directly (see
// POST /api/candidate/resume-autofill).
export class ResumeParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParsingError";
  }
}

const EDUCATION_LEVELS = ["HIGH_SCHOOL", "DIPLOMA", "ASSOCIATE", "BACHELORS", "MASTERS", "DOCTORATE", "OTHER"] as const;

export interface ParsedEducation {
  level: (typeof EDUCATION_LEVELS)[number];
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
}

export interface ParsedWorkExperience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface ParsedCertification {
  title: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ParsedProject {
  title: string;
  subtitle: string;
  techStack: string;
  date: string;
  description: string;
  url: string;
}

export interface ParsedResumeFields {
  fullName: string;
  headline: string;
  phone: string;
  education: ParsedEducation[];
  workExperience: ParsedWorkExperience[];
  skills: string[];
  certifications: ParsedCertification[];
  projects: ParsedProject[];
}

const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function buildPrompt(resumeText: string): string {
  return `You are extracting structured profile data from a candidate's resume for a job platform. Read the resume text below and extract only what is factually present — never invent, guess, or infer anything not actually stated.

Critically: do NOT extract, infer, or mention disability status, health conditions, accommodation needs, age, gender, or any other protected characteristic, even if something in the text might hint at one. This platform collects that separately and directly from the candidate — your job is limited to career/education/skills facts only.

Resume text:
"""
${resumeText.slice(0, 12000)}
"""

Respond with a JSON object of exactly this shape, and nothing else. Use "" for any string field that isn't present, false for isCurrent if unclear, and [] for any list with nothing found. Dates should be "YYYY-MM-DD" where derivable (use the 1st of the month if only month/year is known), otherwise "".

{
  "fullName": "<full name as written on the resume, or \\"\\">",
  "headline": "<a short professional headline/title, e.g. 'Frontend Developer', or \\"\\">",
  "phone": "<phone number as written, or \\"\\">",
  "education": [{"level": "<one of HIGH_SCHOOL|DIPLOMA|ASSOCIATE|BACHELORS|MASTERS|DOCTORATE|OTHER>", "fieldOfStudy": "<string>", "institution": "<string>", "graduationYear": "<4-digit year or \\"\\">"}],
  "workExperience": [{"title": "<job title>", "company": "<company name>", "startDate": "<YYYY-MM-DD or \\"\\">", "endDate": "<YYYY-MM-DD or \\"\\">", "isCurrent": <boolean>, "description": "<string>"}],
  "skills": ["<skill name>", ...],
  "certifications": [{"title": "<string>", "issuer": "<string>", "date": "<YYYY-MM-DD or \\"\\">", "url": "<string>"}],
  "projects": [{"title": "<string>", "subtitle": "<string>", "techStack": "<comma-separated string>", "date": "<YYYY-MM-DD or \\"\\">", "description": "<string>", "url": "<string>"}]
}`;
}

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ResumeParsingError("Resume autofill isn't configured — missing GROQ_API_KEY.");
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
    throw new ResumeParsingError(`Resume parsing failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new ResumeParsingError("Resume parsing returned an empty response.");
  }
  return text;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function isEducationLevel(v: unknown): v is (typeof EDUCATION_LEVELS)[number] {
  return typeof v === "string" && (EDUCATION_LEVELS as readonly string[]).includes(v);
}

function sanitize(raw: unknown): ParsedResumeFields {
  if (typeof raw !== "object" || raw === null) {
    throw new ResumeParsingError("Malformed resume extraction response.");
  }
  const r = raw as Record<string, unknown>;

  const education: ParsedEducation[] = Array.isArray(r.education)
    ? r.education
        .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
        .map((e) => ({
          level: isEducationLevel(e.level) ? e.level : "OTHER",
          fieldOfStudy: str(e.fieldOfStudy),
          institution: str(e.institution),
          graduationYear: str(e.graduationYear),
        }))
        .filter((e) => e.institution !== "")
    : [];

  const workExperience: ParsedWorkExperience[] = Array.isArray(r.workExperience)
    ? r.workExperience
        .filter((w): w is Record<string, unknown> => typeof w === "object" && w !== null)
        .map((w) => ({
          title: str(w.title),
          company: str(w.company),
          startDate: str(w.startDate),
          endDate: str(w.endDate),
          isCurrent: w.isCurrent === true,
          description: str(w.description),
        }))
        .filter((w) => w.title !== "" || w.company !== "")
    : [];

  const skills: string[] = Array.isArray(r.skills)
    ? r.skills.filter((s): s is string => typeof s === "string" && s.trim() !== "")
    : [];

  const certifications: ParsedCertification[] = Array.isArray(r.certifications)
    ? r.certifications
        .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
        .map((c) => ({ title: str(c.title), issuer: str(c.issuer), date: str(c.date), url: str(c.url) }))
        .filter((c) => c.title !== "")
    : [];

  const projects: ParsedProject[] = Array.isArray(r.projects)
    ? r.projects
        .filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null)
        .map((p) => ({
          title: str(p.title),
          subtitle: str(p.subtitle),
          techStack: str(p.techStack),
          date: str(p.date),
          description: str(p.description),
          url: str(p.url),
        }))
        .filter((p) => p.title !== "")
    : [];

  const fields: ParsedResumeFields = {
    fullName: str(r.fullName),
    headline: str(r.headline),
    phone: str(r.phone),
    education,
    workExperience,
    skills,
    certifications,
    projects,
  };

  const isEmpty =
    fields.fullName === "" &&
    fields.education.length === 0 &&
    fields.workExperience.length === 0 &&
    fields.skills.length === 0;
  if (isEmpty) {
    throw new ResumeParsingError(
      "Couldn't find any usable profile details in that file — try a different file, or enter your details manually.",
    );
  }

  return fields;
}

export async function extractResumeFields(resumeText: string): Promise<ParsedResumeFields> {
  if (resumeText.trim().length < 30) {
    throw new ResumeParsingError(
      "That file doesn't seem to contain readable text — try a different file, or enter your details manually.",
    );
  }
  const raw = await callGroq(buildPrompt(resumeText));
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ResumeParsingError("Resume parsing returned invalid JSON.");
  }
  return sanitize(parsed);
}
