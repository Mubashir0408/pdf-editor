import path from "node:path";
import fs from "node:fs/promises";
import JSZip from "jszip";

import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { resolveUploadedFilePath } from "../utils/resolveUploadedFile";
import { escapeHtml } from "../utils/htmlEscape";
import { parsePptx, type PptxPresentation, type PptxShape, type PptxTextRun } from "../utils/pptxParser";
import type { HtmlRendererService } from "./htmlRenderer.service";
import type { DownloadService } from "./download.service";
import type { PowerpointToPdfBody } from "../validators/powerpointToPdf.validator";
import type { ProcessedFileDto } from "../types/file";

/**
 * PowerPoint → PDF. There's no good pure-JS renderer for .pptx (unlike
 * docx/xlsx, which have solid conversion-to-HTML libraries), so this parses
 * the slide XML directly (see `pptxParser.ts`) into positioned text/image
 * shapes and renders each slide as an absolutely-positioned HTML page sized
 * to the deck's real slide dimensions, then prints that through Puppeteer —
 * one PDF page per slide. See `pptxParser.ts` for exactly what is and isn't
 * reproduced (no tables/charts/connectors, no theme colors, no inherited
 * layout placeholders).
 */
export class PowerpointToPdfService {
  constructor(
    private readonly htmlRenderer: HtmlRendererService,
    private readonly downloadService: DownloadService
  ) {}

  async convert(body: PowerpointToPdfBody): Promise<ProcessedFileDto> {
    if (path.extname(body.fileId).toLowerCase() !== ".pptx") {
      throw ApiError.badRequest("The selected file is not a PowerPoint (.pptx) presentation.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);

    let presentation: PptxPresentation;
    try {
      const zip = await JSZip.loadAsync(await fs.readFile(inputPath));
      presentation = await parsePptx(zip);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.badRequest(`This presentation couldn't be read: ${reason}`);
    }

    if (presentation.slides.length === 0) {
      throw ApiError.badRequest("This presentation has no slides to convert.");
    }

    const pdfBytes = await this.htmlRenderer.renderToPdf(this.renderHtml(presentation), {
      width: `${presentation.widthIn}in`,
      height: `${presentation.heightIn}in`,
      printBackground: true,
    });

    const result = await this.downloadService.save({
      tool: "powerpoint-to-pdf",
      outputName: "Converted Presentation.pdf",
      bytes: pdfBytes,
    });

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after PowerPoint to PDF conversion");
    });

    return result;
  }

  private renderHtml(presentation: PptxPresentation): string {
    const slidesHtml = presentation.slides
      .map((slide) => `<div class="slide">${slide.shapes.map((shape) => this.renderShape(shape)).join("")}</div>`)
      .join("\n");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Segoe UI", Arial, Helvetica, sans-serif; }
  .slide {
    position: relative;
    width: ${presentation.widthPx}px;
    height: ${presentation.heightPx}px;
    overflow: hidden;
    background: #ffffff;
    page-break-after: always;
  }
  .slide:last-child { page-break-after: auto; }
  .shape { position: absolute; overflow: hidden; }
  .shape p { margin: 0; white-space: pre-wrap; line-height: 1.25; }
  .shape img { width: 100%; height: 100%; object-fit: contain; }
</style>
</head>
<body>${slidesHtml}</body>
</html>`;
  }

  private renderShape(shape: PptxShape): string {
    const style = `left:${shape.xPx}px; top:${shape.yPx}px; width:${shape.widthPx}px; height:${shape.heightPx}px;`;

    if (shape.kind === "image") {
      return `<div class="shape" style="${style}"><img src="${shape.dataUri}" alt="" /></div>`;
    }

    const paragraphsHtml = shape.paragraphs
      .map((paragraph) => {
        const runsHtml = paragraph.runs.map((run) => this.renderRun(run)).join("");
        return `<p style="text-align:${paragraph.align};">${paragraph.bulleted ? "• " : ""}${runsHtml}</p>`;
      })
      .join("");

    return `<div class="shape" style="${style}">${paragraphsHtml}</div>`;
  }

  private renderRun(run: PptxTextRun): string {
    const style = [
      `font-size:${run.sizePt}pt`,
      `color:${run.color}`,
      `font-weight:${run.bold ? "bold" : "normal"}`,
      `font-style:${run.italic ? "italic" : "normal"}`,
    ].join(";");
    return `<span style="${style}">${escapeHtml(run.text)}</span>`;
  }
}
