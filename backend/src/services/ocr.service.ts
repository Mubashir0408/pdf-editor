import { createWorker } from "tesseract.js";

import { ApiError } from "../utils/ApiError";

/** Maps this app's UI locale codes to Tesseract's trained-data language codes. */
const TESSERACT_LANG_MAP: Record<string, string> = {
  en: "eng",
  de: "deu",
  fr: "fra",
  es: "spa",
  it: "ita",
  pt: "por",
  tr: "tur",
  ar: "ara",
  hi: "hin",
  ur: "urd",
  zh: "chi_sim",
  ja: "jpn",
};

/**
 * Runs OCR over one or more page images with a single Tesseract worker
 * (loading trained-data for a language is the expensive part, so every
 * page in a document shares one worker instead of paying that cost per
 * page). Used as a fallback by Translate PDF when a page has no
 * extractable text — i.e. it's a scanned page rather than real text.
 */
export class OcrService {
  async recognizePages(imageBuffers: Buffer[], languageHint: string): Promise<string[]> {
    const lang = TESSERACT_LANG_MAP[languageHint] ?? "eng";

    let worker;
    try {
      worker = await createWorker(lang);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.serviceUnavailable(`OCR is temporarily unavailable: ${reason}`);
    }

    try {
      const texts: string[] = [];
      for (const buffer of imageBuffers) {
        const { data } = await worker.recognize(buffer);
        texts.push(data.text);
      }
      return texts;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.internal(`OCR failed while reading this document: ${reason}`);
    } finally {
      await worker.terminate();
    }
  }
}

/** Splits raw OCR text (which has no structured paragraph markup) into
 *  blank-line-separated blocks, the closest approximation OCR output gives
 *  us to real paragraphs. */
export function splitOcrTextIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);
}
