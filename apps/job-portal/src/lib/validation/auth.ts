import { z } from "zod";

export const signupSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("CANDIDATE"),
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(1),
    phone: z.string().trim().min(7).max(20),
  }),
  z.object({
    role: z.literal("EMPLOYER"),
    email: z.string().email(),
    password: z.string().min(8),
    organizationName: z.string().min(1),
    organizationType: z.enum(["COMPANY", "UNIVERSITY"]).default("COMPANY"),
    // Optional — never required to sign up. Internal-only for now, see
    // User.hrTrainedOnDisabilityHiring.
    hrTrainedOnDisabilityHiring: z.boolean().optional(),
    hrTrainingNotes: z.string().trim().max(1000).optional(),
  }),
]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verificationChannelSchema = z.enum(["EMAIL", "PHONE"]);

export const sendCodeSchema = z.object({
  channel: verificationChannelSchema,
});

export const verifyCodeSchema = z.object({
  channel: verificationChannelSchema,
  code: z.string().trim().length(6),
});
