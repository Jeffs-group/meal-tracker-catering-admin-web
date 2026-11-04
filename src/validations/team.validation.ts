import { z } from "zod";

export const teamNameRegex = /^[a-zA-Z0-9\s'-]+$/;

export const teamFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(40, "Team name must be at most 40 characters")
    .regex(
      teamNameRegex,
      "Only letters, numbers, spaces, hyphens, and apostrophes are allowed",
    ),
  league: z.enum(["KSPL", "ISCL"], {
    required_error: "Please select a tournament league",
  }),
});

export type TeamFormValues = z.infer<typeof teamFormSchema>;

