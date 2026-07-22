import { z } from "zod";

export const disabilityCategorySchema = z.enum([
  "VISUAL",
  "HEARING",
  "MOBILITY",
  "COGNITIVE",
  "SPEECH",
  "CHRONIC_ILLNESS",
  "MENTAL_HEALTH",
  "OTHER",
]);

export const educationLevelSchema = z.enum([
  "HIGH_SCHOOL",
  "DIPLOMA",
  "ASSOCIATE",
  "BACHELORS",
  "MASTERS",
  "DOCTORATE",
  "OTHER",
]);

export const experienceLevelSchema = z.enum(["ENTRY", "MID", "SENIOR", "LEAD"]);

const educationInputSchema = z.object({
  level: educationLevelSchema,
  fieldOfStudy: z.string().trim().min(1).optional(),
  institution: z.string().trim().min(1),
  graduationYear: z.number().int().min(1950).max(2100).optional(),
});

const workExperienceInputSchema = z.object({
  title: z.string().trim().min(1),
  company: z.string().trim().min(1),
  startDate: z.string().datetime().or(z.string().date()),
  endDate: z.string().datetime().or(z.string().date()).optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().optional(),
});

export const candidateProfileInputSchema = z.object({
  fullName: z.string().trim().min(1),
  headline: z.string().trim().optional(),
  resumeUrl: z.string().trim().url().optional().or(z.literal("")),
  accessibilityNeeds: z.array(z.string().trim().min(1)).default([]),
  disabilityCategories: z.array(disabilityCategorySchema).default([]),
  disabilityOther: z.string().trim().optional(),
  experienceLevel: experienceLevelSchema.optional(),
  preferredCategories: z.array(z.string().trim().min(1)).default([]),
  preferredLocations: z.array(z.string().trim().min(1)).default([]),
  openToRemote: z.boolean().default(false),
  education: z.array(educationInputSchema).default([]),
  workExperience: z.array(workExperienceInputSchema).default([]),
  skills: z.array(z.string().trim().min(1)).default([]),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileInputSchema>;
