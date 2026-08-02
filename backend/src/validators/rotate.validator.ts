import { z } from "zod";

import { storedFileIdSchema } from "./common.validator";

export const rotateBodySchema = z.object({
  fileId: storedFileIdSchema,
  /** Page number (as a string, since JSON object keys always are) -> the
   *  page's final absolute rotation in degrees. */
  rotations: z
    .record(
      z.string().regex(/^\d+$/, "Page keys must be numbers"),
      z.number().int().refine((v) => v % 90 === 0, "Rotation must be a multiple of 90 degrees")
    )
    .refine((r) => Object.keys(r).length > 0, "Select at least one page to rotate"),
});

export type RotateBody = z.infer<typeof rotateBodySchema>;
