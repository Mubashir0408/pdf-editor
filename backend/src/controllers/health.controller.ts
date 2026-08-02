import type { Request, Response } from "express";

import { healthService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const report = healthService.check();

  sendSuccess(res, report, "Health check complete", 200);
});
