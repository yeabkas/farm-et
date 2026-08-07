import { z } from "zod";

export const onboardingSchema = z.object({
  // User info
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),

  // Farm Info
  farmName: z.string().min(2, "Farm name is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  // Preferences
  // 🚀 UPDATED: Added additional measurement system options
  unitSystem: z.enum([
    "metric",
    "imperial",
    "us_customary",
    "ethiopian_traditional",
    "mixed"
  ]),
  timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().min(1, "Currency is required"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;