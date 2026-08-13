import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { WatermarkBody } from "../validators/watermark.validator";
import type { ProcessedFileDto } from "../api-types";

export class WatermarkService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async watermark(body: WatermarkBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    const watermarkedBytes = await this.pdfService.watermark(inputPath, {
      text: body.text,
      position: body.position,
      opacity: body.opacity / 100,
      fontSize: body.fontSize,
      rotation: body.rotation,
    });

    const result = await this.downloadService.save({
      tool: "watermark",
      outputName: "Watermarked Document.pdf",
      bytes: watermarkedBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after watermarking");
    });

    return result;
  }
}
