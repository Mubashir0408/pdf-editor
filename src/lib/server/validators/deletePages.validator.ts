import type { z } from "zod";

import { pagesBodySchema } from "./common.validator";

export const deletePagesBodySchema = pagesBodySchema;

export type DeletePagesBody = z.infer<typeof deletePagesBodySchema>;
