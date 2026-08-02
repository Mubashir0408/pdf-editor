import path from "node:path";

import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { resolveUploadedFilePath } from "../utils/resolveUploadedFile";
import { createZip } from "../utils/zip";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { SplitBody } from "../validators/split.validator";
import type { ProcessedFileDto } from "../types/file";

/**
 * Orchestrates the Split tool. Both modes reduce to the same shape —
 * "here are N groups of page numbers, give me N PDFs" — which
 * `PdfService.splitIntoGroups` already provides; this service's only job
 * is deciding what those groups are (mode-dependent) and packaging the
 * result: a single PDF straight through if there's only one group, a zip
 * if there's more than one.
 */
export class SplitService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async split(body: SplitBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    const groups =
      body.mode === "pages"
        ? await this.buildPerPageGroups(inputPath)
        : body.groups;

    const parts = await this.pdfService.splitIntoGroups(inputPath, groups);

    const result = await this.saveResult(parts, groups);

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after split");
    });

    return result;
  }

  private async buildPerPageGroups(inputPath: string): Promise<number[][]> {
    const totalPages = await this.pdfService.getPageCount(inputPath);
    return Array.from({ length: totalPages }, (_, i) => [i + 1]);
  }

  private async saveResult(parts: Uint8Array[], groups: number[][]): Promise<ProcessedFileDto> {
    if (parts.length === 1) {
      return this.downloadService.save({
        tool: "split",
        outputName: "Split Pages.pdf",
        bytes: parts[0]!,
      });
    }

    const entries = parts.map((bytes, i) => ({
      name: `${this.groupLabel(groups[i]!)}.pdf`,
      bytes,
    }));
    const zipBytes = await createZip(entries);

    return this.downloadService.save({
      tool: "split",
      outputName: "Split Pages.zip",
      bytes: zipBytes,
    });
  }

  /** "Page 7", "Pages 1-4", or "Pages 2,5,9" for a non-contiguous group. */
  private groupLabel(pages: number[]): string {
    if (pages.length === 1) return `Page ${pages[0]}`;

    const sorted = [...pages].sort((a, b) => a - b);
    const isContiguous = sorted.every((p, i) => i === 0 || p === sorted[i - 1]! + 1);

    return isContiguous
      ? `Pages ${sorted[0]}-${sorted[sorted.length - 1]}`
      : `Pages ${sorted.join(",")}`;
  }
}
