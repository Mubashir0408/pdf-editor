import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

/**
 * Every environment variable the server depends on is validated once, at
 * startup, so a misconfigured deployment fails immediately with a clear
 * message instead of surfacing as a confusing runtime error later.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  UPLOAD_PATH: z.string().min(1).default("uploads"),
  MAX_UPLOAD_SIZE: z.coerce.number().int().positive().default(104_857_600),
  GENERATED_PATH: z.string().min(1).default("generated"),

  /** Comma-separated list of allowed frontend origins in production, e.g.
   *  "https://app.example.com,https://example.com" — see config/cors.ts. */
  FRONTEND_ORIGIN: z.string().optional(),

  /** How long an uploaded or generated file may sit on disk before the
   *  periodic sweep (server.ts) deletes it — covers files left behind by
   *  abandoned uploads or downloads that never happened. */
  TEMP_FILE_MAX_AGE_MS: z.coerce.number().int().positive().default(60 * 60 * 1000),

  /** Server-only Supabase project config for auth + usage tracking — never
   *  sent to the frontend. Optional at boot (so a missing key doesn't take
   *  down the whole app); routes that need it fail clearly if it's unset. */
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  /** Server-only OpenRouter key for AI Chat — never sent to the frontend.
   *  Optional at boot (fail-open, same pattern as Supabase above); the
   *  `/chat` endpoint returns a clean error if it's unset rather than
   *  crashing the whole server. */
  OPENROUTER_API_KEY: z.string().optional(),
  /** Defaults to OpenRouter's own free-model router, which costs nothing
   *  and requires no model selection — override only to pin a specific
   *  free model. */
  OPENROUTER_MODEL: z.string().min(1).default("openrouter/free"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    // The logger depends on env, so we can't use it yet — this is the one
    // legitimate place in the codebase for a direct console call.
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }

  return parsed.data;
}

const parsedEnv = loadEnv();

export const env = {
  ...parsedEnv,
  isProduction: parsedEnv.NODE_ENV === "production",
  isDevelopment: parsedEnv.NODE_ENV === "development",
  isTest: parsedEnv.NODE_ENV === "test",
  /** Absolute, OS-correct paths — resolved once here so nothing else needs to. */
  uploadDir: path.resolve(process.cwd(), parsedEnv.UPLOAD_PATH),
  generatedDir: path.resolve(process.cwd(), parsedEnv.GENERATED_PATH),
  /** Parsed once from the comma-separated `FRONTEND_ORIGIN` — empty in
   *  production until it's actually configured, which `config/cors.ts`
   *  treats as "reject every cross-origin request" rather than silently
   *  allowing anything. */
  frontendOrigins: (parsedEnv.FRONTEND_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
