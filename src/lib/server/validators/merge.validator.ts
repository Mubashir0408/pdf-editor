import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const mergeBodySchema = z.object({
  fileIds: z
    .array(storedFileIdSchema)
    .min(2, "Select at least 2 files to merge")
    .max(20, "You can merge up to 20 files at once"),
});

export type MergeBody = z.infer<typeof mergeBodySchema>;
