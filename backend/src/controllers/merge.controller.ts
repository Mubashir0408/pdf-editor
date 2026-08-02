import type { Request, Response } from "express";

import { mergeService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { MergeBody } from "../validators/merge.validator";

export const mergePdfs = asyncHandler(async (req: Request, res: Response) => {
  const { fileIds } = req.body as MergeBody;

  const result = await mergeService.merge(fileIds);

  logger.info(
    { requestId: req.id, processedFileId: result.id, fileCount: fileIds.length },
    "PDFs merged"
  );

  sendSuccess(res, result, "Files merged successfully", 201);
});
