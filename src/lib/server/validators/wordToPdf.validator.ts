import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const wordToPdfBodySchema = z.object({
  fileId: storedFileIdSchema,
});

export type WordToPdfBody = z.infer<typeof wordToPdfBodySchema>;
