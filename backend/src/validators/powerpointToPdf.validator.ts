import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const powerpointToPdfBodySchema = z.object({
  fileId: storedFileIdSchema,
});

export type PowerpointToPdfBody = z.infer<typeof powerpointToPdfBodySchema>;
