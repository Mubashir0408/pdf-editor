import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

const pageGroupSchema = z.array(z.number().int().positive()).min(1);

export const splitBodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("range"),
    fileId: storedFileIdSchema,
    groups: z.array(pageGroupSchema).min(1, "Provide at least one page range"),
  }),
  z.object({
    mode: z.literal("pages"),
    fileId: storedFileIdSchema,
  }),
]);

export type SplitBody = z.infer<typeof splitBodySchema>;
