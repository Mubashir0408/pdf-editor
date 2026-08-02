import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

import { env } from "../config/env";
import { isAllowedFile } from "../utils/fileValidator";
import { generateStoredFileName } from "../utils/pathHelpers";
import { ApiError } from "../utils/ApiError";

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, env.uploadDir);
  },
  filename: (_req, file, callback) => {
    callback(null, generateStoredFileName(file.originalname));
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
  if (!isAllowedFile(file.originalname, file.mimetype)) {
    callback(
      ApiError.unsupportedMediaType(
        `Unsupported file type. Allowed types: PDF, DOCX, PPTX, XLSX, JPG, PNG.`
      )
    );
    return;
  }
  callback(null, true);
}

/**
 * Single shared Multer instance. `MAX_UPLOAD_SIZE` is enforced here (Multer
 * aborts the stream as soon as the limit is exceeded, rather than buffering
 * an oversized file to disk first) and again reflected in the Express
 * `limits` config in app.ts as a defense-in-depth measure for non-file body
 * size.
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE,
    files: 1,
  },
});
