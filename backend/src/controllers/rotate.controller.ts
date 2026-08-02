import type { Request, Response } from "express";

import { rotateService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { RotateBody } from "../validators/rotate.validator";

export const rotatePdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RotateBody;

  const result = await rotateService.rotate(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "PDF rotated");

  sendSuccess(res, result, "File rotated successfully", 201);
});
