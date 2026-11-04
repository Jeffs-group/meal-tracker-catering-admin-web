import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("https://api.example.com/api/v1"),
  VITE_API_TIMEOUT_MS: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 15000)),
  VITE_APP_NAME: z.string().default("Catering Organization Admin"),
  VITE_APP_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
});

const parsed = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_TIMEOUT_MS: import.meta.env.VITE_API_TIMEOUT_MS,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment variables configuration");
}

export const env = parsed.data;
