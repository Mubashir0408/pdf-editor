import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveManyUploadedFilePaths } from "../resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { ProcessedFileDto } from "../api-types";

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

    void this.downloadService.deleteQuietly(inputPaths, (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after merge");
    });

    return result;
  }
}
