import type { Request, Response } from "express";

import { protectService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { ProtectBody } from "../validators/protect.validator";

export const protectPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ProtectBody;

  const result = await protectService.protect(body);

  // Never log the password itself — only that protection happened.
  logger.info({ requestId: req.id, processedFileId: result.id }, "PDF password protected");

  sendSuccess(res, result, "File protected successfully", 201);
});
