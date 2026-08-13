import path from "node:path";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import type { PdfEncryptionService } from "./pdfEncryption.service";
import type { DownloadService } from "./download.service";
import type { ProtectBody } from "../validators/protect.validator";
import type { ProcessedFileDto } from "../api-types";

export class ProtectService {
  constructor(
    private readonly pdfEncryptionService: PdfEncryptionService,
    private readonly downloadService: DownloadService
  ) {}

  async protect(body: ProtectBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    const protectedBytes = await this.pdfEncryptionService.protect(inputPath, {
      password: body.password,
      allowPrinting: body.allowPrinting,
      allowCopying: body.allowCopying,
    });

    const result = await this.downloadService.save({
      tool: "protect",
      outputName: "Protected Document.pdf",
      bytes: protectedBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after password protecting");
    });

    return result;
  }
}
