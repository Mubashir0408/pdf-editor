import fs from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

import { ApiError } from "../utils/ApiError";

/**
 * Pure PDF manipulation, built on pdf-lib. Deliberately knows nothing about
 * HTTP, the database, or the on-disk layout of uploads/generated files —
 * every method takes bytes/paths in and returns bytes out, which keeps it
 * trivially reusable across every tool milestone (merge now; split,
 * rotate, extract, delete-pages, watermark, protect later) without ever
 * needing to change this class's shape.
 */
export class PdfService {
  /**
   * Merges PDFs in the given order into a single document. `labels` (the
   * original filenames, same length/order as `inputPaths`) exists purely
   * so a load failure can name the offending file instead of just saying
   * "a file" — genuinely helpful to a user picking files to merge.
   */
  async merge(inputPaths: string[], labels: string[]): Promise<Uint8Array> {
    const merged = await PDFDocument.create();

    for (const [i, inputPath] of inputPaths.entries()) {
      const label = labels[i] ?? inputPath;
      const source = await this.loadPdf(inputPath, label);

      const copiedPages = await merged.copyPages(source, source.getPageIndices());
      copiedPages.forEach((page) => merged.addPage(page));
    }

    return merged.save();
  }

  /**
   * Loads a PDF from disk, translating pdf-lib's low-level parse failures
   * into a message a non-technical user can actually act on.
   */
  private async loadPdf(filePath: string, label: string): Promise<PDFDocument> {
    const bytes = await fs.readFile(filePath);

    try {
      return await PDFDocument.load(bytes);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      if (reason.toLowerCase().includes("encrypt")) {
        throw ApiError.badRequest(
          `"${label}" is password-protected. Remove the password before merging it.`
        );
      }
      throw ApiError.badRequest(`"${label}" doesn't look like a valid PDF file.`);
    }
  }
}
