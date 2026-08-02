import type { Request, Response } from "express";

import { splitService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { SplitBody } from "../validators/split.validator";

export const splitPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as SplitBody;

  const result = await splitService.split(body);

  logger.info({ requestId: req.id, processedFileId: result.id, mode: body.mode }, "PDF split");

  sendSuccess(res, result, "File split successfully", 201);
});
