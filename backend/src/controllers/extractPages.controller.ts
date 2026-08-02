import type { Request, Response } from "express";

import { extractPagesService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { PagesBody } from "../validators/common.validator";

export const extractPages = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as PagesBody;

  const result = await extractPagesService.extract(body);

  logger.info(
    { requestId: req.id, processedFileId: result.id, pageCount: body.pages.length },
    "Pages extracted"
  );

  sendSuccess(res, result, "Pages extracted successfully", 201);
});
