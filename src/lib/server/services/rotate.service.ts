import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { RotateBody } from "../validators/rotate.validator";
import type { ProcessedFileDto } from "../api-types";

export class RotateService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async rotate(body: RotateBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    const rotations = Object.fromEntries(
      Object.entries(body.rotations).map(([page, degreesValue]) => [Number(page), degreesValue])
    );
    const rotatedBytes = await this.pdfService.rotate(inputPath, rotations);

    const result = await this.downloadService.save({
      tool: "rotate",
      outputName: "Rotated Document.pdf",
      bytes: rotatedBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after rotate");
    });

    return result;
  }
}
