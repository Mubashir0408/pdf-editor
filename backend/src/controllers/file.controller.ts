import type { Request, Response } from "express";

import { fileService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

export const getFileById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const file = await fileService.getById(id);

  sendSuccess(res, file, "File retrieved successfully");
});
