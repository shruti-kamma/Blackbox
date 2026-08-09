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

export const accommodationTypeSchema = z.enum([
  "SCREEN_READER_SUPPORT",
  "SIGN_LANGUAGE_INTERPRETER",
  "CAPTIONING",
  "WHEELCHAIR_ACCESSIBLE_WORKSPACE",
  "ASSISTIVE_TECHNOLOGY_STIPEND",
  "FLEXIBLE_HOURS",
  "REMOTE_FRIENDLY",
  "ERGONOMIC_WORKSTATION",
  "ACCESSIBLE_TRANSPORTATION",
  "EXTENDED_BREAKS",
  "JOB_COACH_SUPPORT",
  "OTHER",
]);

export const preferredCommunicationModeSchema = z.enum([
  "SIGN_LANGUAGE_INTERPRETER",
  "SCREEN_READER_COMPATIBLE",
  "CAPTIONS_OR_TRANSCRIPT",
  "EXTRA_RESPONSE_TIME",
  "WRITTEN_ONLY",
  "OTHER",
]);

export const bodyPartSchema = z.enum([
  "LEFT_ARM",
  "RIGHT_ARM",
  "BOTH_ARMS",
  "LEFT_LEG",
  "RIGHT_LEG",
  "BOTH_LEGS",
  "HAND",
  "SPINE",
  "MULTIPLE",
  "OTHER",
]);

const disabilityDetailInputSchema = z.object({
  category: disabilityCategorySchema,
  severityPercentage: z.number().int().min(0).max(100).optional(),
  affectedBodyPart: bodyPartSchema.optional(),
});

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

const projectInputSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  techStack: z.string().trim().optional(),
  date: z.string().datetime().or(z.string().date()).optional(),
  description: z.string().trim().optional(),
  url: z.string().trim().url().optional().or(z.literal("")),
});

const certificationInputSchema = z.object({
  title: z.string().trim().min(1),
  issuer: z.string().trim().optional(),
  date: z.string().datetime().or(z.string().date()).optional(),
  url: z.string().trim().url().optional().or(z.literal("")),
});

export const candidateProfileInputSchema = z.object({
  fullName: z.string().trim().min(1),
  headline: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  dateOfBirth: z.string().trim().date().optional().or(z.literal("")),
  resumeUrl: z.string().trim().url().optional().or(z.literal("")),
  accessibilityNeeds: z.array(z.string().trim().min(1)).default([]),
  disabilityCategories: z.array(disabilityCategorySchema).default([]),
  disabilityOther: z.string().trim().optional(),
  accommodationNeeds: z.array(accommodationTypeSchema).default([]),
  confirmedNoAccommodationNeeds: z.boolean().default(false),
  preferredCommunicationModes: z.array(preferredCommunicationModeSchema).default([]),
  disabilityDetails: z.array(disabilityDetailInputSchema).default([]),
  assistiveTechnologies: z.array(z.string().trim().min(1)).default([]),
  experienceLevel: experienceLevelSchema.optional(),
  preferredCategories: z.array(z.string().trim().min(1)).default([]),
  preferredLocations: z.array(z.string().trim().min(1)).default([]),
  openToRemote: z.boolean().default(false),
  education: z.array(educationInputSchema).default([]),
  workExperience: z.array(workExperienceInputSchema).default([]),
  projects: z.array(projectInputSchema).default([]),
  certifications: z.array(certificationInputSchema).default([]),
  skills: z.array(z.string().trim().min(1)).default([]),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileInputSchema>;
