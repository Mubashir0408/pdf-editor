import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const pdfToWordBodySchema = z.object({
  fileId: storedFileIdSchema,
});

export type PdfToWordBody = z.infer<typeof pdfToWordBodySchema>;
