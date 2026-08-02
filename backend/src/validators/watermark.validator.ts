import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const watermarkPositions = [
  "center",
  "diagonal",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export const watermarkBodySchema = z.object({
  fileId: storedFileIdSchema,
  text: z
    .string()
    .trim()
    .min(1, "Watermark text is required")
    .max(100, "Watermark text must be 100 characters or fewer"),
  position: z.enum(watermarkPositions),
  /** Percent, 10-100 */
  opacity: z.number().min(10).max(100),
  fontSize: z.number().int().min(8).max(120),
  /** Degrees */
  rotation: z.number().min(-180).max(180),
});

export type WatermarkBody = z.infer<typeof watermarkBodySchema>;
