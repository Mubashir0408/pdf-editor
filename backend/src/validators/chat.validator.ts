import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const chatBodySchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000, "Message is too long"),
  fileId: storedFileIdSchema.optional(),
});

export type ChatBody = z.infer<typeof chatBodySchema>;
