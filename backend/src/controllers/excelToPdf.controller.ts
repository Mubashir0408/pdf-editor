import type { Request, Response } from "express";

import { excelToPdfService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { ExcelToPdfBody } from "../validators/excelToPdf.validator";

export const convertExcelToPdf = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as ExcelToPdfBody;

  const result = await excelToPdfService.convert(body);

  logger.info({ requestId: req.id, processedFileId: result.id }, "Spreadsheet converted to PDF");

  sendSuccess(res, result, "Converted to PDF successfully", 201);
});
