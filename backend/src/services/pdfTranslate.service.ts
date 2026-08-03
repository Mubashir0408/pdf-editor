import path from "node:path";
import fs from "node:fs/promises";
import { createCanvas } from "@napi-rs/canvas";
import translate from "google-translate-api-x";
import { Document, Packer, Paragraph, TextRun } from "docx";

import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import { resolveUploadedFilePath } from "../utils/resolveUploadedFile";
import { loadPdfjs, standardFontDataUrl } from "../utils/pdfjs";
import { extractParagraphs } from "../utils/pdfTextLines";
import { escapeHtml } from "../utils/htmlEscape";
import { wrapHtmlDocument } from "../utils/htmlDocument";
import { OcrService, splitOcrTextIntoParagraphs } from "./ocr.service";
import type { HtmlRendererService } from "./htmlRenderer.service";
import type { DownloadService } from "./download.service";
import type { TranslationJobsService } from "./translationJobs.service";
import type { TranslateBody } from "../validators/translate.validator";

const MAX_PAGES = 30;
const MAX_CHARACTERS = 100_000;
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 250;
const OCR_RENDER_SCALE = 2;

/** `zh` isn't a valid Google Translate ISO code on its own (only `zh-CN`/`zh-TW` are) — every
 *  other one of this app's 12 UI locale codes maps to Google's code unchanged. */
const GOOGLE_LANG_OVERRIDES: Record<string, string> = { zh: "zh-CN" };
function toGoogleLangCode(code: string): string {
  return GOOGLE_LANG_OVERRIDES[code] ?? code;
}

interface PageParagraphs {
  paragraphs: string[];
  wasOcr: boolean;
}

/**
 * Translate PDF: extract each page's text (falling back to OCR for pages
 * with none — i.e. scanned pages), translate paragraph-by-paragraph
 * through Google's free translate endpoint, and produce the result as
 * PDF, TXT, and DOCX. Runs as a background job (see
 * `TranslationJobsService`) since OCR and per-batch translation calls make
 * this the slowest tool in the app by a wide margin — a caller polls
 * `GET /translate/:jobId` for real stage/percentage progress instead of
 * blocking on one request.
 */
export class PdfTranslateService {
  private readonly ocrService = new OcrService();

  constructor(
    private readonly htmlRenderer: HtmlRendererService,
    private readonly downloadService: DownloadService,
    private readonly jobs: TranslationJobsService
  ) {}

  startJob(body: TranslateBody): string {
    const jobId = this.jobs.create();
    void this.run(jobId, body).catch((err) => {
      const message =
        err instanceof ApiError ? err.message : "We couldn't translate this document. Please try again.";
      this.jobs.update(jobId, { status: "error", stage: "error", error: message });
      logger.error({ err, jobId }, "Translate job failed");
    });
    return jobId;
  }

  getStatus(jobId: string) {
    const state = this.jobs.get(jobId);
    if (!state) {
      throw ApiError.notFound("This translation job was not found. It may have expired — please try again.");
    }
    return state;
  }

  private async run(jobId: string, body: TranslateBody): Promise<void> {
    if (path.extname(body.fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The selected file is not a PDF.");
    }

    const inputPath = await resolveUploadedFilePath(body.fileId);
    this.jobs.update(jobId, { stage: "extracting", progress: 5 });

    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await fs.readFile(inputPath));

    let doc;
    try {
      doc = await pdfjs.getDocument({ data, standardFontDataUrl: standardFontDataUrl() }).promise;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.badRequest(`This file doesn't look like a valid PDF: ${reason}`);
    }

    if (doc.numPages === 0) {
      throw ApiError.badRequest("This PDF has no pages.");
    }
    if (doc.numPages > MAX_PAGES) {
      throw ApiError.badRequest(
        `This PDF has ${doc.numPages} pages — translation supports documents up to ${MAX_PAGES} pages at a time.`
      );
    }

    const pages: PageParagraphs[] = [];
    const ocrCandidates: { pageIndex: number; imageBuffer: Buffer }[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const paragraphs = extractParagraphs(textContent.items);

      if (paragraphs.length > 0) {
        pages.push({ paragraphs, wasOcr: false });
        continue;
      }

      // No selectable text on this page — rasterize it for OCR.
      const viewport = page.getViewport({ scale: OCR_RENDER_SCALE });
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      ocrCandidates.push({ pageIndex: pages.length, imageBuffer: canvas.toBuffer("image/png") });
      pages.push({ paragraphs: [], wasOcr: false });
    }

    if (ocrCandidates.length > 0) {
      this.jobs.update(jobId, { stage: "ocr", progress: 15 });
      const ocrLangHint = body.sourceLang === "auto" ? "en" : body.sourceLang;
      const ocrTexts = await this.ocrService.recognizePages(
        ocrCandidates.map((c) => c.imageBuffer),
        ocrLangHint
      );
      ocrCandidates.forEach((candidate, i) => {
        const paragraphs = splitOcrTextIntoParagraphs(ocrTexts[i] ?? "");
        pages[candidate.pageIndex] = { paragraphs, wasOcr: true };
      });
    }

    const totalCharacters = pages.reduce(
      (sum, p) => sum + p.paragraphs.reduce((s, para) => s + para.length, 0),
      0
    );

    if (totalCharacters === 0) {
      throw ApiError.badRequest(
        "This PDF has no text we could read — even after attempting OCR on every page. It may be blank or too low quality to scan."
      );
    }
    if (totalCharacters > MAX_CHARACTERS) {
      throw ApiError.badRequest(
        `This document has too much text to translate safely in one request (${totalCharacters.toLocaleString()} characters, limit ${MAX_CHARACTERS.toLocaleString()}). Try a shorter document or split it first.`
      );
    }

    const flatParagraphs: { pageIndex: number; text: string }[] = [];
    pages.forEach((page, pageIndex) => {
      page.paragraphs.forEach((text) => flatParagraphs.push({ pageIndex, text }));
    });

    const total = flatParagraphs.length;
    const translatedTexts: string[] = new Array(total);
    const sourceLang = body.sourceLang === "auto" ? "auto" : toGoogleLangCode(body.sourceLang);
    const targetLang = toGoogleLangCode(body.targetLang);

    this.jobs.update(jobId, { stage: "translating", progress: 20, current: 0, total });

    for (let i = 0; i < flatParagraphs.length; i += BATCH_SIZE) {
      const batch = flatParagraphs.slice(i, i + BATCH_SIZE);
      let results;
      try {
        results = await translate(batch.map((p) => p.text), {
          from: sourceLang,
          to: targetLang,
          forceFrom: true,
          forceTo: true,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        throw ApiError.serviceUnavailable(
          `The translation service is temporarily unavailable: ${reason}. Please try again in a moment.`
        );
      }

      const resultArray = Array.isArray(results) ? results : [results];
      resultArray.forEach((r, idx) => {
        translatedTexts[i + idx] = r.text;
      });

      const current = Math.min(i + BATCH_SIZE, total);
      this.jobs.update(jobId, { progress: 20 + Math.round((current / total) * 60), current, total });

      if (i + BATCH_SIZE < flatParagraphs.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const translatedPages: string[][] = pages.map(() => []);
    flatParagraphs.forEach((p, i) => {
      translatedPages[p.pageIndex]!.push(translatedTexts[i]!);
    });

    this.jobs.update(jobId, { stage: "rendering", progress: 85 });

    const [pdfResult, txtResult, docxResult] = await Promise.all([
      this.renderPdf(translatedPages),
      this.renderTxt(translatedPages),
      this.renderDocx(translatedPages),
    ]);

    void this.downloadService.deleteQuietly([inputPath], (filePath, err) => {
      logger.warn({ filePath, err }, "Failed to delete a temporary upload after translation");
    });

    this.jobs.update(jobId, {
      status: "done",
      stage: "done",
      progress: 100,
      result: {
        translatedText: translatedPages.map((p) => p.join("\n\n")).join("\n\n"),
        ocrPageCount: ocrCandidates.length,
        files: { pdf: pdfResult, txt: txtResult, docx: docxResult },
      },
    });
  }

  private async renderPdf(pages: string[][]) {
    const html = wrapHtmlDocument(
      pages
        .map(
          (paragraphs, i) =>
            `<section${i > 0 ? ' style="page-break-before: always;"' : ""}>${paragraphs
              .map((p) => `<p>${escapeHtml(p)}</p>`)
              .join("")}</section>`
        )
        .join("")
    );
    const bytes = await this.htmlRenderer.renderToPdf(html, { format: "A4" });
    return this.downloadService.save({ tool: "translate", outputName: "Translated Document.pdf", bytes });
  }

  private async renderTxt(pages: string[][]) {
    const text = pages.map((paragraphs) => paragraphs.join("\n\n")).join("\n\n\f\n\n");
    return this.downloadService.save({
      tool: "translate",
      outputName: "Translated Document.txt",
      bytes: Buffer.from(text, "utf-8"),
    });
  }

  private async renderDocx(pages: string[][]) {
    const children: Paragraph[] = [];
    pages.forEach((paragraphs, pageIndex) => {
      if (paragraphs.length === 0) {
        children.push(new Paragraph({ pageBreakBefore: pageIndex > 0, children: [] }));
        return;
      }
      paragraphs.forEach((text, i) => {
        children.push(
          new Paragraph({
            pageBreakBefore: pageIndex > 0 && i === 0,
            children: [new TextRun(text)],
          })
        );
      });
    });

    const buffer = await Packer.toBuffer(new Document({ sections: [{ children }] }));
    return this.downloadService.save({ tool: "translate", outputName: "Translated Document.docx", bytes: buffer });
  }
}
