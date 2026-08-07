import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const chatBodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long (max 4000 characters)"),
  fileId: storedFileIdSchema.optional(),
});

export type ChatBody = z.infer<typeof chatBodySchema>;
