import type { Request, Response } from "express";

import { powerpointToPdfService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { PowerpointToPdfBody } from "../validators/powerpointToPdf.validator";

export const convertPowerpointToPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as PowerpointToPdfBody;

  const result = await powerpointToPdfService.convert(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "Presentation converted to PDF");

  sendSuccess(res, result, "Converted to PDF successfully", 201);
});
