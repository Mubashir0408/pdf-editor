import { z } from "zod";

/** Reused by every route shaped as `GET /something/:id`. */
export const idParamSchema = z.object({
  id: z.string().uuid("Id must be a valid UUID"),
});

export type IdParam = z.infer<typeof idParamSchema>;
