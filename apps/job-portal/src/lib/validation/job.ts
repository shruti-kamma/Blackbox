import { z } from "zod";
import {
  accommodationTypeSchema,
  disabilityCategorySchema,
  educationLevelSchema,
  experienceLevelSchema,
} from "./candidate-profile";

export const jobInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
  location: z.string().trim().optional(),
  remote: z.boolean().default(false),
  employmentType: z.string().trim().optional(),
  accommodationsOffered: z.array(z.string().trim().min(1)).default([]),
  targetDisabilityCategories: z.array(disabilityCategorySchema).default([]),
  accommodationTypes: z.array(accommodationTypeSchema).default([]),
  requiredEducationLevel: educationLevelSchema.optional(),
  requiredEducationField: z.string().trim().optional(),
  requiredExperienceLevel: experienceLevelSchema.optional(),
  requiredSkills: z.array(z.string().trim().min(1)).default([]),
  preferredAssistiveTechnologies: z.array(z.string().trim().min(1)).default([]),
  requiresAiInterview: z.boolean().default(false),
});

export type JobInput = z.infer<typeof jobInputSchema>;
