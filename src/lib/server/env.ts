import { z } from "zod";

/**
 * Server-only environment config — mirrors the old Express backend's
 * `config/env.ts` exactly, minus the Express-specific path/CORS fields
 * that no longer apply now that everything is one Next.js deployment.
 * Never imported from a Client Component (nothing here is `NEXT_PUBLIC_*`).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  MAX_UPLOAD_SIZE: z.coerce.number().int().positive().default(104_857_600),
  /** How long a Storage object may exist before the cron sweep deletes it. */
  TEMP_FILE_MAX_AGE_MS: z.coerce.number().int().positive().default(60 * 60 * 1000),

  /** Reused from the public var — the URL itself isn't secret. */
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  /** Server-only, SECRET — never exposed to the browser. */
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().min(1).default("openrouter/free"),

  /** Server-only, SECRET — never exposed to the browser. Signup confirmation
   *  email is skipped (logged, not thrown) when unset. */
  RESEND_API_KEY: z.string().optional(),
  /** "From" address for the signup welcome email — must be a verified
   *  domain/sender in Resend, or their sandbox `onboarding@resend.dev`. */
  RESEND_FROM_EMAIL: z.string().min(1).default("onboarding@resend.dev"),

  /** Vercel Cron sends this in an Authorization header — verified by the
   *  cleanup route so the endpoint can't be triggered by anyone else. */
  CRON_SECRET: z.string().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    console.error(`Invalid environment configuration:\n${issues}`);
    throw new Error("Invalid environment configuration");
  }

  return parsed.data;
}

const parsedEnv = loadEnv();

export const env = {
  ...parsedEnv,
  SUPABASE_URL: parsedEnv.NEXT_PUBLIC_SUPABASE_URL,
  isProduction: parsedEnv.NODE_ENV === "production",
  isDevelopment: parsedEnv.NODE_ENV === "development",
} as const;
