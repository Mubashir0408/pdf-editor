import type { Request, Response } from "express";

import { downloadService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const displayName = typeof req.query.name === "string" ? req.query.name : undefined;

  await downloadService.streamToResponse(id, displayName, res);
});
