import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const excelToPdfBodySchema = z.object({
  fileId: storedFileIdSchema,
});

export type ExcelToPdfBody = z.infer<typeof excelToPdfBodySchema>;
