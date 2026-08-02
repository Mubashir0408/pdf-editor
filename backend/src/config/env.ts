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

  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),

  JWT_SECRET: z.string().min(1).default("dev-secret-change-me"),
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
} as const;
