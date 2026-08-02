import type { Request, Response } from "express";

import { watermarkService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { WatermarkBody } from "../validators/watermark.validator";

export const watermarkPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as WatermarkBody;

  const result = await watermarkService.watermark(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "PDF watermarked");

  sendSuccess(res, result, "Watermark applied successfully", 201);
});
