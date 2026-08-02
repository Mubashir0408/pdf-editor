import type { Request, Response } from "express";

import { pdfService } from "../services";
import { resolveUploadedFilePath } from "../utils/resolveUploadedFile";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";

/**
 * Lightweight, read-only lookup — not a "tool" with its own orchestration
 * service, just enough for the page-selection UIs (Split, Rotate, Extract,
 * Delete) to know a real page count instead of guessing.
 */
export const getPdfInfo = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const filePath = await resolveUploadedFilePath(id);
  const pageCount = await pdfService.getPageCount(filePath);

  sendSuccess(res, { pageCount });
});
