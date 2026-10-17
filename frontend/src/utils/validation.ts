import { z } from "zod";
import { COLLEGE_DOMAIN, SKILLS_LIST, AVAILABILITY_OPTIONS } from "@/utils/constants";
import type { Availability, NeedMode } from "@/types";

export const emailSchema = z.string().email("Invalid email address").refine(
  (email) => email.toLowerCase().endsWith(COLLEGE_DOMAIN.toLowerCase()),
  `Email must be a ${COLLEGE_DOMAIN} address`
);

export const otpSchema = z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric");

export const signupSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  branch: z.string().min(1, "Please select your branch"),
  year: z.number().min(1).max(5),
  skills: z.array(z.string()).min(1, "Add at least one skill").max(10, "Maximum 10 skills"),
  availability: z.enum(AVAILABILITY_OPTIONS.map(o => o.value) as [Availability, ...Availability[]]),
  bio: z.string().max(300, "Bio must be 300 characters or less").optional(),
});

export const needSchema = z.object({
  mode: z.enum(["learn", "buddy"] as [NeedMode, ...NeedMode[]]),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description too long"),
  requiredSkills: z.array(z.string()).min(1, "Add at least one required skill").max(8, "Maximum 8 skills"),
  duration: z.number().min(15).max(120).optional(), // Learn mode: 15-120 minutes
  deadline: z.string().optional(), // Buddy mode: ISO date string
  rolesNeeded: z.array(z.object({
    title: z.string().min(2).max(50),
    skills: z.array(z.string()).min(1),
    description: z.string().max(200).optional(),
  })).optional(),
}).refine(data => {
  if (data.mode === "learn") return data.duration && data.duration >= 15;
  return true;
}, {
  message: "Duration required for Learn mode (15-120 min)",
  path: ["duration"],
}).refine(data => {
  if (data.mode === "buddy") return data.deadline && new Date(data.deadline) > new Date();
  return true;
}, {
  message: "Future deadline required for Buddy mode",
  path: ["deadline"],
}).refine(data => {
  if (data.mode === "buddy") return data.rolesNeeded && data.rolesNeeded.length > 0;
  return true;
}, {
  message: "At least one role required for Buddy mode",
  path: ["rolesNeeded"],
});

export const agreementSchema = z.object({
  roles: z.array(z.object({
    userId: z.string(),
    roleTitle: z.string().min(2).max(50),
    responsibilities: z.array(z.string()).min(1, "At least one responsibility required"),
  })).min(2, "Both participants must have roles"),
  deadline: z.string().min(1, "Deadline is required"),
  expectedOutput: z.string().min(20, "Describe expected output (min 20 chars)").max(1000),
});

export const feedbackSchema = z.object({
  ratings: z.object({
    communication: z.number().min(1).max(5),
    reliability: z.number().min(1).max(5),
    skill: z.number().min(1).max(5),
    responsiveness: z.number().min(1).max(5),
  }),
  comment: z.string().max(500, "Comment too long").optional(),
  isAnonymous: z.boolean().default(true),
});

export const rewardRedemptionSchema = z.object({
  rewardId: z.string(),
  userId: z.string(),
});

// Type exports for form inference
export type SignupForm = z.infer<typeof signupSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type ProfileForm = z.infer<typeof profileSchema>;
export type NeedForm = z.infer<typeof needSchema>;
export type AgreementForm = z.infer<typeof agreementSchema>;
export type FeedbackForm = z.infer<typeof feedbackSchema>;