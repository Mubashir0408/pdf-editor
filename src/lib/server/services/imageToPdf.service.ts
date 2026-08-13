import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveManyUploadedFilePaths } from "../resolveUploadedFile";
import type { PdfService } from "./pdf.service";
import type { DownloadService } from "./download.service";
import type { ImageToPdfBody } from "../validators/imageToPdf.validator";
import type { ProcessedFileDto } from "../api-types";

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export class ImageToPdfService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly downloadService: DownloadService
  ) {}

  async convert(body: ImageToPdfBody): Promise<ProcessedFileDto> {
    const invalid = body.fileIds.find((id) => !ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(id).toLowerCase()));
    if (invalid) {
      throw ApiError.badRequest("Only JPG and PNG images can be converted to PDF.");
    }

    const inputPaths = await resolveManyUploadedFilePaths(body.fileIds);
    const labels = body.fileIds.map((_, i) => `Image ${i + 1}`);

    const pdfBytes = await this.pdfService.imagesToPdf(inputPaths, labels);

    const result = await this.downloadService.save({
      tool: "image-to-pdf",
      outputName: inputPaths.length === 1 ? "Converted Image.pdf" : "Converted Images.pdf",
      bytes: pdfBytes,
    });

    void this.downloadService.deleteQuietly(inputPaths, (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after Image to PDF conversion");
    });

    return result;
  }
}
