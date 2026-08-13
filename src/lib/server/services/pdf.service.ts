import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import { ApiError } from "../ApiError";

export type WatermarkPosition = "center" | "diagonal" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface WatermarkOptions {
  text: string;
  position: WatermarkPosition;
  opacity: number;
  fontSize: number;
  rotation: number;
}

/**
 * Ported unchanged from the old Express backend's `pdf.service.ts` — pure
 * PDF manipulation via pdf-lib, knows nothing about HTTP or storage.
 */
export class PdfService {
  async getPageCount(inputPath: string, label = "the file"): Promise<number> {
    const doc = await this.loadPdf(inputPath, label);
    return doc.getPageCount();
  }

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

  async rotate(inputPath: string, rotations: Record<number, number>, label = "the file"): Promise<Uint8Array> {
    const doc = await this.loadPdf(inputPath, label);
    const totalPages = doc.getPageCount();

    for (const [pageStr, value] of Object.entries(rotations)) {
      const pageNumber = Number(pageStr);
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
        throw ApiError.badRequest(`Page ${pageStr} is out of range — this document has ${totalPages} pages.`);
      }
      const normalized = ((value % 360) + 360) % 360;
      doc.getPage(pageNumber - 1).setRotation(degrees(normalized));
    }

    return doc.save();
  }

  async extractPages(inputPath: string, pageNumbers: number[], label = "the file"): Promise<Uint8Array> {
    const source = await this.loadPdf(inputPath, label);
    this.assertPagesInRange(pageNumbers, source.getPageCount());
    return this.buildFromPages(source, pageNumbers);
  }

  async splitIntoGroups(inputPath: string, groups: number[][], label = "the file"): Promise<Uint8Array[]> {
    const source = await this.loadPdf(inputPath, label);
    const totalPages = source.getPageCount();
    groups.forEach((group) => this.assertPagesInRange(group, totalPages));

    return Promise.all(groups.map((group) => this.buildFromPages(source, group)));
  }

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

  async imagesToPdf(inputPaths: string[], labels: string[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();

    for (const [i, inputPath] of inputPaths.entries()) {
      const label = labels[i] ?? inputPath;
      const bytes = await fs.readFile(inputPath);
      const isPng = path.extname(inputPath).toLowerCase() === ".png";

      try {
        const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        const page = doc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      } catch {
        throw ApiError.badRequest(`"${label}" doesn't look like a valid image file.`);
      }
    }

    return doc.save();
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
      throw ApiError.badRequest(`Page ${outOfRange} is out of range — this document has ${totalPages} pages.`);
    }
  }

  private async loadPdf(filePath: string, label: string): Promise<PDFDocument> {
    const bytes = await fs.readFile(filePath);

    try {
      return await PDFDocument.load(bytes);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      if (reason.toLowerCase().includes("encrypt")) {
        throw ApiError.badRequest(`"${label}" is password-protected. Remove the password before processing it.`);
      }
      throw ApiError.badRequest(`"${label}" doesn't look like a valid PDF file.`);
    }
  }
}
