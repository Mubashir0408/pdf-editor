import { pagesBodySchema } from "./common.validator";

export const deletePagesBodySchema = pagesBodySchema;

export type DeletePagesBody = typeof deletePagesBodySchema._type;
