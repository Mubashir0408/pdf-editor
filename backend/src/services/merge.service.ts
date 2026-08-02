import path from "node:path";

import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { resolveManyUploadedFilePaths } from "../utils/resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { ProcessedFileDto } from "../types/file";

/**
 * Orchestrates the Merge tool: resolve the requested upload ids to paths on
 * disk (each id is already validated upstream to match the exact filename
 * shape our own storage layer generates — see common.validator.ts), make
 * sure they're all actually PDFs, hand their paths to PdfService, and save
 * the result via DownloadService. Every tool service follows this same
 * shape — a small class that wires the shared services together so none
 * of them needs to know anything about any specific tool.
 *
 * Nothing here touches a database — `fileIds` map straight onto
 * `uploadDir/<id>` because that filename *is* the id (see
 * `upload.service.ts`).
 */
export class MergeService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async merge(fileIds: string[]): Promise<ProcessedFileDto> {
    fileIds.forEach((id, i) => {
      if (path.extname(id).toLowerCase() !== ".pdf") {
        throw ApiError.badRequest(`File ${i + 1} is not a PDF.`);
      }
    });

    const inputPaths = await resolveManyUploadedFilePaths(fileIds);

    const labels = fileIds.map((_, i) => `file ${i + 1}`);
    const mergedBytes = await this.pdfService.merge(inputPaths, labels);

    const result = await this.downloadService.save({
      tool: "merge",
      outputName: "Merged Document.pdf",
      bytes: mergedBytes,
    });

    // Only reached after a successful merge — on failure, the uploads stay
    // in place so the frontend's "try again" doesn't have to re-upload
    // files that were already fine.
    void this.downloadService.deleteQuietly(inputPaths, (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after merge");
    });

    return result;
  }
}
