import type { Request, Response } from "express";

import { healthService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

/**
 * Always responds with `success: true` and the full report as `data` — a
 * degraded database is informational, not a failed request. The HTTP
 * status code still reflects health (200 vs 503) so uptime monitors and
 * load balancers that only look at the status code behave correctly.
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const report = await healthService.check();
  const statusCode = report.status === "ok" ? 200 : 503;

  sendSuccess(res, report, "Health check complete", statusCode);
});
