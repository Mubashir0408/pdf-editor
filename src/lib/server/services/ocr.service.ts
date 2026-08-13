import { createWorker } from "tesseract.js";

import { ApiError } from "../ApiError";

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

/** Ported unchanged from the old Express backend's `ocr.service.ts` — used
 *  as Translate's scanned-page fallback. Pure JS/WASM, no native binary, so
 *  it runs on Vercel's Node runtime the same as it does locally. */
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

export function splitOcrTextIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0);
}
