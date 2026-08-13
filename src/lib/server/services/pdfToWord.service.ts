import path from "node:path";
import fs from "node:fs/promises";
import { Document, Packer, Paragraph, TextRun } from "docx";

import { logger } from "../logger";
import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import { loadPdfjs, standardFontDataUrl } from "../utils/pdfjs";
import { extractTextLines } from "../utils/pdfTextLines";
import type { DownloadService } from "./download.service";
import type { PdfToWordBody } from "../validators/pdfToWord.validator";
import type { ProcessedFileDto } from "../api-types";

export class PdfToWordService {
  constructor(private readonly downloadService: DownloadService) {}

  async convert(body: PdfToWordBody): Promise<ProcessedFileDto> {
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

    const pagesOfLines: string[][] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      pagesOfLines.push(extractTextLines(textContent.items));
    }

    if (pagesOfLines.every((lines) => lines.length === 0)) {
      throw ApiError.badRequest(
        "This PDF has no extractable text — it may be a scanned or image-only document. Try the OCR tool instead."
      );
    }

    const docxBuffer = await Packer.toBuffer(buildDocument(pagesOfLines));

    const result = await this.downloadService.save({
      tool: "pdf-to-word",
      outputName: "Converted Document.docx",
      bytes: docxBuffer,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after PDF to Word conversion");
    });

    return result;
  }
}

function buildDocument(pagesOfLines: string[][]): Document {
  const children: Paragraph[] = [];

  pagesOfLines.forEach((lines, pageIndex) => {
    if (lines.length === 0) {
      children.push(new Paragraph({ pageBreakBefore: pageIndex > 0, children: [] }));
      return;
    }

    lines.forEach((line, lineIndex) => {
      children.push(
        new Paragraph({
          pageBreakBefore: pageIndex > 0 && lineIndex === 0,
          children: [new TextRun(line)],
        })
      );
    });
  });

  return new Document({ sections: [{ children }] });
}
