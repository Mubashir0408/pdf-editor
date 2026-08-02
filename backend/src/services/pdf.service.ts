import fs from "node:fs/promises";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import { ApiError } from "../utils/ApiError";

export type WatermarkPosition =
  | "center"
  | "diagonal"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface WatermarkOptions {
  text: string;
  position: WatermarkPosition;
  /** 0–1 */
  opacity: number;
  fontSize: number;
  /** Degrees */
  rotation: number;
}

/**
 * Pure PDF manipulation, built on pdf-lib. Deliberately knows nothing about
 * HTTP, the on-disk layout of uploads/generated files, or any specific
 * tool's request shape — every method takes bytes/paths in and returns
 * bytes out, which is what keeps it reusable across every tool (merge,
 * split, rotate, extract, delete-pages, watermark) without ever needing to
 * change this class's shape. Password protection is the one PDF operation
 * *not* here — it needs real encryption support, which pdf-lib doesn't
 * have; see `protect.service.ts`, which uses `@cantoo/pdf-lib` instead.
 */
export class PdfService {
  async getPageCount(inputPath: string, label = "the file"): Promise<number> {
    const doc = await this.loadPdf(inputPath, label);
    return doc.getPageCount();
  }

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
   * Sets each listed page's rotation to an absolute value (not additive —
   * matches the frontend, which already accumulates total degrees per page
   * across repeated clicks and sends the final value). Keys are 1-indexed
   * page numbers.
   */
  async rotate(inputPath: string, rotations: Record<number, number>, label = "the file"): Promise<Uint8Array> {
    const doc = await this.loadPdf(inputPath, label);
    const totalPages = doc.getPageCount();

    for (const [pageStr, value] of Object.entries(rotations)) {
      const pageNumber = Number(pageStr);
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
        throw ApiError.badRequest(
          `Page ${pageStr} is out of range — this document has ${totalPages} pages.`
        );
      }
      const normalized = ((value % 360) + 360) % 360;
      doc.getPage(pageNumber - 1).setRotation(degrees(normalized));
    }

    return doc.save();
  }

  /**
   * Builds a new PDF containing exactly the given 1-indexed pages, in the
   * order given. Extract Pages calls this directly; Delete Pages calls it
   * with the complement of the pages the user chose to remove — same
   * primitive, no duplicated page-copying logic between the two tools.
   */
  async extractPages(inputPath: string, pageNumbers: number[], label = "the file"): Promise<Uint8Array> {
    const source = await this.loadPdf(inputPath, label);
    this.assertPagesInRange(pageNumbers, source.getPageCount());
    return this.buildFromPages(source, pageNumbers);
  }

  /**
   * Splits one PDF into several, one per group of 1-indexed page numbers.
   * Used by Split for both its modes — "by range" (each comma-separated
   * range is a group) and "every page" (each group is a single page).
   */
  async splitIntoGroups(inputPath: string, groups: number[][], label = "the file"): Promise<Uint8Array[]> {
    const source = await this.loadPdf(inputPath, label);
    const totalPages = source.getPageCount();
    groups.forEach((group) => this.assertPagesInRange(group, totalPages));

    return Promise.all(groups.map((group) => this.buildFromPages(source, group)));
  }

  /**
   * Draws `text` onto every page at the given position/opacity/size/
   * rotation. Rotation is applied around the anchor point pdf-lib draws
   * from (the text's bottom-left corner), not the page center — for a
   * large rotation on a corner-anchored watermark that can visually run
   * off the page edge; center/diagonal placements (the common case) are
   * unaffected since their anchor is already the page's midpoint.
   */
  async watermark(inputPath: string, options: WatermarkOptions, label = "the file"): Promise<Uint8Array> {
    const doc = await this.loadPdf(inputPath, label);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const margin = 36; // 0.5in

    for (const page of doc.getPages()) {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
      const textHeight = font.heightAtSize(options.fontSize);

      const { x, y } = this.watermarkAnchor(options.position, { width, height, textWidth, textHeight, margin });

      page.drawText(options.text, {
        x,
        y,
        size: options.fontSize,
        font,
        color: rgb(0.45, 0.45, 0.45),
        opacity: options.opacity,
        rotate: degrees(options.rotation),
      });
    }

    return doc.save();
  }

  private watermarkAnchor(
    position: WatermarkPosition,
    dims: { width: number; height: number; textWidth: number; textHeight: number; margin: number }
  ): { x: number; y: number } {
    const { width, height, textWidth, textHeight, margin } = dims;

    switch (position) {
      case "top-left":
        return { x: margin, y: height - margin - textHeight };
      case "top-right":
        return { x: width - margin - textWidth, y: height - margin - textHeight };
      case "bottom-left":
        return { x: margin, y: margin };
      case "bottom-right":
        return { x: width - margin - textWidth, y: margin };
      case "center":
      case "diagonal":
      default:
        return { x: (width - textWidth) / 2, y: (height - textHeight) / 2 };
    }
  }

  private async buildFromPages(source: PDFDocument, pageNumbers: number[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const indices = pageNumbers.map((n) => n - 1);
    const copiedPages = await doc.copyPages(source, indices);
    copiedPages.forEach((page) => doc.addPage(page));
    return doc.save();
  }

  private assertPagesInRange(pageNumbers: number[], totalPages: number): void {
    const outOfRange = pageNumbers.find((n) => n < 1 || n > totalPages);
    if (outOfRange !== undefined) {
      throw ApiError.badRequest(
        `Page ${outOfRange} is out of range — this document has ${totalPages} pages.`
      );
    }
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
          `"${label}" is password-protected. Remove the password before processing it.`
        );
      }
      throw ApiError.badRequest(`"${label}" doesn't look like a valid PDF file.`);
    }
  }
}
