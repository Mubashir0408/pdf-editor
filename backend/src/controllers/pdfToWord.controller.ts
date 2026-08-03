import type { Request, Response } from "express";

import { pdfToWordService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { PdfToWordBody } from "../validators/pdfToWord.validator";

export const convertPdfToWord = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as PdfToWordBody;

  const result = await pdfToWordService.convert(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "PDF converted to Word");

  sendSuccess(res, result, "Converted to Word successfully", 201);
});
