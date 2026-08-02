import { z } from "zod";

export const mergeBodySchema = z.object({
  fileIds: z
    .array(z.string().uuid("Each file id must be a valid UUID"))
    .min(2, "Select at least 2 files to merge")
    .max(20, "You can merge up to 20 files at once"),
});

export type MergeBody = z.infer<typeof mergeBodySchema>;
