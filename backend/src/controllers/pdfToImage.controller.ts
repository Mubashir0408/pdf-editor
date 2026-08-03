import type { Request, Response } from "express";

import { pdfToImageService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { PdfToImageBody } from "../validators/pdfToImage.validator";

export const convertPdfToImage = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as PdfToImageBody;

  const result = await pdfToImageService.convert(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "PDF converted to image(s)");

  sendSuccess(res, result, "Converted successfully", 201);
});
