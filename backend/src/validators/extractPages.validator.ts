import { pagesBodySchema } from "./common.validator";

export const extractPagesBodySchema = pagesBodySchema;

export type ExtractPagesBody = typeof extractPagesBodySchema._type;
