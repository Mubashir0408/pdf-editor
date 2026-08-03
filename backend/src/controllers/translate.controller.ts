import type { Request, Response } from "express";

import { pdfTranslateService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { logger } from "../config/logger";
import type { TranslateBody, TranslateJobParam } from "../validators/translate.validator";

export const startTranslateJob = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as TranslateBody;

  const jobId = pdfTranslateService.startJob(body);

  logger.info({ requestId: req.id, jobId }, "Translation job started");

  sendSuccess(res, { jobId }, "Translation started", 202);
});

export const getTranslateJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params as unknown as TranslateJobParam;

  const status = pdfTranslateService.getStatus(jobId);

  sendSuccess(res, status, "Translation job status", 200);
});
