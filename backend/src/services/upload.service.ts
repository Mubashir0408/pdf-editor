import path from "node:path";

import type { UploadedFileDto } from "../types/file";

/**
 * There is no persistence step here on purpose: by the time this runs,
 * Multer has already validated and written the file to `uploadDir` under
 * its generated name (`file.filename`) — that filename *is* the id a
 * later tool call (e.g. `/merge`) will reference. Nothing needs recording
 * anywhere else for that to work.
 */
export class UploadService {
  toDto(file: Express.Multer.File): UploadedFileDto {
    const now = new Date().toISOString();

    return {
      id: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase(),
      size: file.size,
      status: "UPLOADED",
      createdAt: now,
      updatedAt: now,
    };
  }
}
