import path from "node:path";
import fs from "node:fs/promises";

import { ApiError } from "../ApiError";
import { resolveUploadedFilePath } from "../resolveUploadedFile";
import { loadPdfjs, standardFontDataUrl } from "../utils/pdfjs";
import { extractParagraphs } from "../utils/pdfTextLines";
import type { OpenRouterService } from "./openrouter.service";
import type { ChatBody } from "../validators/chat.validator";

const MAX_PAGES = 50;
const MAX_CONTEXT_CHARACTERS = 200_000;
const TRUNCATION_NOTICE =
  "\n\n[Note: this document was too long to include in full. The content above has been truncated to the first " +
  `${MAX_CONTEXT_CHARACTERS.toLocaleString()} characters.]`;

/** Ported from the old Express backend's `chat.service.ts` — identical
 *  logic, only `resolveUploadedFilePath` now resolves against Supabase
 *  Storage (via a `/tmp` download) instead of a local `uploads/` dir. */
export class ChatService {
  constructor(private readonly openRouter: OpenRouterService) {}

  async ask(body: ChatBody): Promise<string> {
    const documentContent = body.fileId ? await this.extractDocumentContent(body.fileId) : null;
    return this.openRouter.answer(body.message, documentContent);
  }

  private async extractDocumentContent(fileId: string): Promise<string> {
    if (path.extname(fileId).toLowerCase() !== ".pdf") {
      throw ApiError.badRequest("The attached file is not a PDF.");
    }

    const filePath = await resolveUploadedFilePath(fileId);

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
        `This PDF has ${doc.numPages} pages — AI Chat supports documents up to ${MAX_PAGES} pages.`
      );
    }

    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const paragraphs = extractParagraphs(textContent.items);
      if (paragraphs.length > 0) {
        pageTexts.push(paragraphs.join("\n\n"));
      }
    }

    let documentContent = pageTexts.join("\n\n");

    if (documentContent.trim().length === 0) {
      throw ApiError.badRequest(
        "This PDF has no extractable text — it may be a scanned document. AI Chat currently supports PDFs with selectable text."
      );
    }

    if (documentContent.length > MAX_CONTEXT_CHARACTERS) {
      documentContent = documentContent.slice(0, MAX_CONTEXT_CHARACTERS) + TRUNCATION_NOTICE;
    }

    return documentContent;
  }
}
