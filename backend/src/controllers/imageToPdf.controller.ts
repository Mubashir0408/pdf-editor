import type { Request, Response } from "express";

import { imageToPdfService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { ImageToPdfBody } from "../validators/imageToPdf.validator";

export const convertImageToPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ImageToPdfBody;

  const result = await imageToPdfService.convert(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "Images converted to PDF");

  sendSuccess(res, result, "Converted to PDF successfully", 201);
});
