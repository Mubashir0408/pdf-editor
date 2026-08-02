import type { Request, Response } from "express";

import { deletePagesService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { PagesBody } from "../validators/common.validator";

export const deletePages = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as PagesBody;

  const result = await deletePagesService.delete(body);

  logger.info(
    { requestId: req.id, processedFileId: result.id, pageCount: body.pages.length },
    "Pages deleted"
  );

  sendSuccess(res, result, "Pages deleted successfully", 201);
});
