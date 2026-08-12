import { z } from "zod";

export const onboardingSchema = z
  .object({
    // ── Account credentials (Step 1) ──────────────────────────────────────
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),

    // ── Personal info (Step 1) ────────────────────────────────────────────
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),

    // ── Farm info (Step 1) ────────────────────────────────────────────────
    farmName: z.string().min(2, "Farm name is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),

    // ── Preferences (Step 2) ──────────────────────────────────────────────
    unitSystem: z.enum([
      "metric",
      "imperial",
      "us_customary",
      "ethiopian_traditional",
      "mixed",
    ]),
    timezone: z.string().min(1, "Timezone is required"),
    currency: z.string().min(1, "Currency is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type OnboardingFormData = z.infer<typeof onboardingSchema>;