import { z } from "zod";

export const signupSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("CANDIDATE"),
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(1),
  }),
  z.object({
    role: z.literal("EMPLOYER"),
    email: z.string().email(),
    password: z.string().min(8),
    organizationName: z.string().min(1),
    organizationType: z.enum(["COMPANY", "UNIVERSITY"]).default("COMPANY"),
  }),
]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
