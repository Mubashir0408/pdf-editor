import fs from "node:fs/promises";
import path from "node:path";

import { ApiError } from "../utils/ApiError";
import { resolveUploadedFilePath } from "../utils/resolveUploadedFile";
import { loadPdfjs, standardFontDataUrl } from "../utils/pdfjs";
import { extractParagraphs } from "../utils/pdfTextLines";
import type { GeminiService } from "./gemini.service";
import type { ChatBody } from "../validators/chat.validator";

const MAX_PAGES = 50;
const MAX_CONTEXT_CHARACTERS = 200_000;

export interface ChatReply {
  reply: string;
}

/**
 * AI Chat: when a `fileId` is attached, extracts that PDF's text (same
 * pdfjs + paragraph-grouping pipeline Translate PDF uses) and grounds the
 * Gemini answer in it; without one, it's a plain conversational request.
 * Stateless — nothing about the conversation or the document is persisted
 * between requests.
 */
export class ChatService {
  constructor(private readonly gemini: GeminiService) {}

  async ask(body: ChatBody): Promise<ChatReply> {
    const documentText = body.fileId ? await this.extractDocumentText(body.fileId) : null;
    const reply = await this.gemini.generate(body.message, documentText);
    return { reply };
  }

  private async extractDocumentText(fileId: string): Promise<string> {
    if (path.extname(fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("AI Chat can currently only read PDF attachments.");
    }

    const filePath = await resolveUploadedFilePath(fileId, "Attached document");

    const pdfjs = await loadPdfjs();
    const data = new Uint8Array(await fs.readFile(filePath));

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
        `This PDF has ${doc.numPages} pages — AI Chat supports documents up to ${MAX_PAGES} pages at a time.`
      );
    }

    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const paragraphs = extractParagraphs(textContent.items);
      if (paragraphs.length > 0) {
        pageTexts.push(`[Page ${pageNumber}]\n${paragraphs.join("\n\n")}`);
      }
    }

    if (pageTexts.length === 0) {
      throw ApiError.badRequest(
        "This PDF has no extractable text — it may be blank, or a scanned/image-only document."
      );
    }

    let text = pageTexts.join("\n\n");
    if (text.length > MAX_CONTEXT_CHARACTERS) {
      text = `${text.slice(0, MAX_CONTEXT_CHARACTERS)}\n\n[Note: this document was truncated to the first ${MAX_CONTEXT_CHARACTERS.toLocaleString()} characters because it's very large — later pages weren't included.]`;
    }

    return text;
  }
}
