import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const imageToPdfBodySchema = z.object({
  fileIds: z
    .array(storedFileIdSchema)
    .min(1, "Select at least 1 image")
    .max(30, "You can convert up to 30 images at once"),
});

export type ImageToPdfBody = z.infer<typeof imageToPdfBodySchema>;
