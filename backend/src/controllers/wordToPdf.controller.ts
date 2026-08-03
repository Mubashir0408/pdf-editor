import type { Request, Response } from "express";

import { wordToPdfService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { WordToPdfBody } from "../validators/wordToPdf.validator";

export const convertWordToPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as WordToPdfBody;

  const result = await wordToPdfService.convert(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "Word document converted to PDF");

  sendSuccess(res, result, "Converted to PDF successfully", 201);
});
