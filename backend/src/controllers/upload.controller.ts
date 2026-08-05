import path from "node:path";
import fs from "node:fs/promises";
import type { Request, Response } from "express";

import { uploadService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { verifyFileContentMatchesExtension } from "../utils/verifyFileContent";
import { logger } from "../config/logger";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest('No file was provided. Attach one under the "file" field.');
  }

  try {
    await verifyFileContentMatchesExtension(req.file.path, path.extname(req.file.originalname));
  } catch (err) {
    await fs.unlink(req.file.path).catch(() => undefined);
    throw err;
  }

  const uploaded = uploadService.toDto(req.file);

  logger.info(
    { requestId: req.id, fileId: uploaded.id, mimeType: uploaded.mimeType, size: uploaded.size },
    "File uploaded"
  );

  sendSuccess(res, uploaded, "File uploaded successfully", 201);
});
