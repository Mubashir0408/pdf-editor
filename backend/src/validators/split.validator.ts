import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

const pageGroupSchema = z.array(z.number().int().positive()).min(1);

/**
 * Two modes, one schema: "range" carries the groups the frontend already
 * parsed from the range input (each comma-separated token — "1-4", "7",
 * "10-12" — becomes its own group, and its own output file); "pages"
 * needs nothing else, the service derives one group per page itself.
 */
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
