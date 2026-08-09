import { z } from "zod";
import {
  accommodationTypeSchema,
  disabilityCategorySchema,
  educationLevelSchema,
  experienceLevelSchema,
} from "./candidate-profile";

export const jobInputSchema = z
  .object({
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
    offersGuaranteedInterview: z.boolean().default(false),
    // Subset of requiredSkills the employer is treating as must-have for the
    // guaranteed-interview commitment — see JobSkill.essential. Anything not
    // also present in requiredSkills is rejected below rather than silently
    // dropped, since that's almost certainly a typo the employer would want
    // to know about.
    essentialSkills: z.array(z.string().trim().min(1)).default([]),
  })
  .refine(
    (input) => {
      const required = new Set(input.requiredSkills.map((s) => s.toLowerCase()));
      return input.essentialSkills.every((s) => required.has(s.toLowerCase()));
    },
    { message: "Essential skills must also be listed as required skills", path: ["essentialSkills"] },
  );

export type JobInput = z.infer<typeof jobInputSchema>;
