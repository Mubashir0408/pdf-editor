import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { PagesBody } from "../validators/common.validator";
import type { ProcessedFileDto } from "../api-types";

export class ExtractPagesService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async extract(body: PagesBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    const sortedPages = [...body.pages].sort((a, b) => a - b);
    const extractedBytes = await this.pdfService.extractPages(inputPath, sortedPages);

    const result = await this.downloadService.save({
      tool: "extract-pages",
      outputName: "Extracted Pages.pdf",
      bytes: extractedBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after extracting pages");
    });

    return result;
  }
}
