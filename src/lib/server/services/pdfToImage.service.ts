import path from "node:path";
import fs from "node:fs/promises";
import { createCanvas } from "@napi-rs/canvas";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import { loadPdfjs, standardFontDataUrl } from "../utils/pdfjs";
import { createZip } from "../utils/zip";
import type { DownloadService } from "./download.service";
import type { PdfToImageBody } from "../validators/pdfToImage.validator";
import type { ProcessedFileDto } from "../api-types";

const RENDER_SCALE = 2;
const JPEG_QUALITY = 90;

export class PdfToImageService {
  constructor(private readonly downloadService: DownloadService) {}

  async convert(body: PdfToImageBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);
    const pdfjs = await loadPdfjs();

    const data = new Uint8Array(await fs.readFile(inputPath));
    let doc;
    try {
      doc = await pdfjs.getDocument({ data, standardFontDataUrl: standardFontDataUrl() }).promise;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.badRequest(`This file doesn't look like a valid PDF: ${reason}`);
    }

    const extension = body.format === "jpg" ? "jpg" : "png";
    const pages: Buffer[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));

      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;

      pages.push(body.format === "jpg" ? canvas.toBuffer("image/jpeg", JPEG_QUALITY) : canvas.toBuffer("image/png"));
    }

    const result = await this.saveResult(pages, extension);

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after PDF to Image conversion");
    });

    return result;
  }

  private async saveResult(pages: Buffer[], extension: string): Promise<ProcessedFileDto> {
    if (pages.length === 1) {
      return this.downloadService.save({
        tool: "pdf-to-image",
        outputName: `Converted Page.${extension}`,
        bytes: pages[0]!,
      });
    }

    const entries = pages.map((bytes, i) => ({ name: `Page ${i + 1}.${extension}`, bytes }));
    const zipBytes = await createZip(entries);

    return this.downloadService.save({
      tool: "pdf-to-image",
      outputName: "Converted Pages.zip",
      bytes: zipBytes,
    });
  }
}
