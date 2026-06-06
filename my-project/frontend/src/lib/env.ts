import { z } from "zod";

const optionalNonEmptyString = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  AUTH_GOOGLE_ID: optionalNonEmptyString,
  AUTH_GOOGLE_SECRET: optionalNonEmptyString,
  BACKEND_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
