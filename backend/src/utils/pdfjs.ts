import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * pdfjs-dist ships ESM-only from v4 onward, even in its "legacy" Node build
 * — there is no CommonJS entry point to `require()` here. This project's
 * backend compiles to CommonJS, so the module is loaded via a dynamic
 * `import()` (which Node's CJS loader can do at runtime) once, lazily, and
 * cached; every caller (PDF → Image, PDF → Word) shares the same loaded
 * instance instead of re-importing it per request.
 *
 * The exact shape below is a hand-written minimal surface (not the
 * package's own types) covering only what this project actually calls —
 * sidesteps relying on TypeScript resolving type declarations for an ESM
 * subpath import under a CommonJS project, which is inconsistent across
 * moduleResolution settings.
 */
export interface PdfjsTextItem {
  str: string;
  transform: number[];
}

export interface PdfjsTextContent {
  items: PdfjsTextItem[];
}

export interface PdfjsViewport {
  width: number;
  height: number;
}

export interface PdfjsPage {
  getViewport(params: { scale: number }): PdfjsViewport;
  render(params: { canvasContext: unknown; viewport: PdfjsViewport }): { promise: Promise<void> };
  getTextContent(): Promise<PdfjsTextContent>;
}

export interface PdfjsDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfjsPage>;
}

export interface PdfjsLib {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(params: { data: Uint8Array; standardFontDataUrl?: string }): { promise: Promise<PdfjsDocument> };
}

let pdfjsPromise: Promise<PdfjsLib> | null = null;

export function loadPdfjs(): Promise<PdfjsLib> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
      const pdfjs = lib as unknown as PdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
        require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs")
      ).href;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

/** Absolute, forward-slash, trailing-slash path pdfjs-dist requires for
 *  loading its bundled standard fonts (glyphs it falls back to when a PDF
 *  doesn't embed its own font program) — without this it still renders,
 *  just with degraded glyph shapes for non-embedded fonts. */
export function standardFontDataUrl(): string {
  const pdfjsRoot = path.dirname(require.resolve("pdfjs-dist/package.json"));
  return path.join(pdfjsRoot, "standard_fonts").replace(/\\/g, "/") + "/";
}
