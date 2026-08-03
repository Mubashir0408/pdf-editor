import path from "node:path";
import mammoth from "mammoth";

import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { resolveUploadedFilePath } from "../utils/resolveUploadedFile";
import { wrapHtmlDocument } from "../utils/htmlDocument";
import type { HtmlRendererService } from "./htmlRenderer.service";
import type { DownloadService } from "./download.service";
import type { WordToPdfBody } from "../validators/wordToPdf.validator";
import type { ProcessedFileDto } from "../types/file";

/**
 * Word → PDF via mammoth (docx → semantic HTML) + a headless-browser print
 * to PDF. This preserves headings, paragraphs, lists, bold/italic, tables,
 * and inline images well; it does not reproduce headers/footers, footnotes,
 * or exact Word pagination — mammoth deliberately only extracts a
 * document's semantic content, not its full layout.
 */
export class WordToPdfService {
  constructor(
    private readonly htmlRenderer: HtmlRendererService,
    private readonly downloadService: DownloadService
  ) {}

  async convert(body: WordToPdfBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".docx") {
      throw ApiError.badRequest("The selected file is not a Word (.docx) document.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    let bodyHtml: string;
    try {
      const converted = await mammoth.convertToHtml({ path: inputPath });
      bodyHtml = converted.value;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.badRequest(`This Word document couldn't be read: ${reason}`);
    }

    const pdfBytes = await this.htmlRenderer.renderToPdf(wrapHtmlDocument(bodyHtml), {
      format: "A4",
    });

    const result = await this.downloadService.save({
      tool: "word-to-pdf",
      outputName: "Converted Document.pdf",
      bytes: pdfBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after Word to PDF conversion");
    });

    return result;
  }
}
