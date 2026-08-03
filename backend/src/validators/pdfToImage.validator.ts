import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const pdfToImageBodySchema = z.object({
  fileId: storedFileIdSchema,
  format: z.enum(["png", "jpg"]).default("png"),
});

export type PdfToImageBody = z.infer<typeof pdfToImageBodySchema>;
