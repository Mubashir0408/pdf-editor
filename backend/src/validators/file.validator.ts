import { idParamSchema } from "./common.validator";

export const getFileParamsSchema = idParamSchema;

export type GetFileParams = typeof getFileParamsSchema._type;
