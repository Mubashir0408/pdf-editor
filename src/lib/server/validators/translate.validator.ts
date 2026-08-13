import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

const SUPPORTED_LANGS = ["en", "de", "fr", "es", "it", "pt", "tr", "ar", "hi", "ur", "zh", "ja"] as const;

export const translateBodySchema = z.object({
  fileId: storedFileIdSchema,
  sourceLang: z.union([z.enum(SUPPORTED_LANGS), z.literal("auto")]).default("auto"),
  targetLang: z.enum(SUPPORTED_LANGS),
});

export type TranslateBody = z.infer<typeof translateBodySchema>;

export const translateJobParamSchema = z.object({
  jobId: z.string().uuid("Invalid job id"),
});

export type TranslateJobParam = z.infer<typeof translateJobParamSchema>;
