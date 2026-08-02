import path from "node:path";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import type { FileService } from "./file.service";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { ProcessedFileDto } from "../types/file";

/**
 * Orchestrates the Merge tool: look up the requested uploads (in the order
 * given), make sure they're all actually PDFs, hand their paths to
 * PdfService, and persist the result via DownloadService. This is the
 * pattern every future tool (split, rotate, ...) follows — a small service
 * per tool that wires the three shared services together, so none of them
 * needs to know anything about any specific tool.
 */
export class MergeService {
  constructor(
    private readonly fileService: FileService,
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async merge(fileIds: string[]): Promise<ProcessedFileDto> {
    const files = await this.fileService.findManyByIdsOrThrow(fileIds);

    const nonPdf = files.find((file) => file.mimeType !== "application/pdf");
    if (nonPdf) {
      throw ApiError.badRequest(`"${nonPdf.originalName}" is not a PDF file.`);
    }

    const inputPaths = files.map((file) => path.join(env.uploadDir, file.storedName));
    const labels = files.map((file) => file.originalName);

    const mergedBytes = await this.pdfService.merge(inputPaths, labels);

    return this.downloadService.save({
      tool: "merge",
      outputName: "Merged Document.pdf",
      bytes: mergedBytes,
      sourceFileIds: fileIds,
    });
  }
}
