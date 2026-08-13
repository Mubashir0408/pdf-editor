import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { PagesBody } from "../validators/common.validator";
import type { ProcessedFileDto } from "../api-types";

export class DeletePagesService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async delete(body: PagesBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);
    const totalPages = await this.pdfService.getPageCount(inputPath);

    const toDelete = new Set(body.pages);
    const outOfRange = body.pages.find((p) => p > totalPages);
    if (outOfRange !== undefined) {
      throw ApiError.badRequest(`Page ${outOfRange} is out of range — this document has ${totalPages} pages.`);
    }

    const remaining = Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => !toDelete.has(page));
    if (remaining.length === 0) {
      throw ApiError.badRequest("You can't delete every page — at least one must remain.");
    }

    const updatedBytes = await this.pdfService.extractPages(inputPath, remaining);

    const result = await this.downloadService.save({
      tool: "delete-pages",
      outputName: "Updated Document.pdf",
      bytes: updatedBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after deleting pages");
    });

    return result;
  }
}
