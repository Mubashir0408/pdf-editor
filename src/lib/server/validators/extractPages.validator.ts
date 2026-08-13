import type { z } from "zod";

import { pagesBodySchema } from "./common.validator";

export const extractPagesBodySchema = pagesBodySchema;

export type ExtractPagesBody = z.infer<typeof extractPagesBodySchema>;
