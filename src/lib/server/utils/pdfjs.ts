import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Ported unchanged from the old Express backend's `utils/pdfjs.ts`.
 * pdfjs-dist ships ESM-only, loaded via a dynamic `import()` and cached.
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

/**
 * `pdfjs-dist`'s own package root. Even with the package listed in
 * `serverExternalPackages`, `require.resolve(...)` *inside a module
 * webpack does bundle* (this file) doesn't resolve to a real filesystem
 * path at runtime under Next.js's RSC build — it resolves against a
 * virtual/synthetic module graph path instead (observed: a `(rsc)` segment
 * spliced into the middle of the path, so the file genuinely isn't found
 * there). Building the path directly from `process.cwd()` — which Next.js
 * sets to the real project root for both `next dev` and `next start`, and
 * Vercel sets to the deployment root the same way — sidesteps webpack's
 * module resolution entirely for this lookup.
 */
function pdfjsPackageRoot(): string {
  return path.join(process.cwd(), "node_modules", "pdfjs-dist");
}

export function loadPdfjs(): Promise<PdfjsLib> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
      const pdfjs = lib as unknown as PdfjsLib;
      const workerPath = path.join(pdfjsPackageRoot(), "legacy", "build", "pdf.worker.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

export function standardFontDataUrl(): string {
  return path.join(pdfjsPackageRoot(), "standard_fonts").replace(/\\/g, "/") + "/";
}
