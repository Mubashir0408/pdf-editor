import path from "node:path";

/**
 * Single source of truth for which file types the platform accepts. Both
 * the Multer file filter and any future validation logic read from this —
 * changing what's allowed means editing exactly one place.
 */
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "image/jpeg",
  "image/png",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".pptx",
  ".xlsx",
  ".jpg",
  ".jpeg",
  ".png",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function isAllowedExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

/**
 * Both checks must pass — relying on the extension alone is trivially
 * spoofable (rename a `.exe` to `.pdf`), and some browsers send generic
 * mime types, so the extension check catches what the mime check misses.
 */
export function isAllowedFile(originalName: string, mimeType: string): boolean {
  return isAllowedExtension(originalName) && isAllowedMimeType(mimeType);
}

/**
 * The reverse lookup — given an output filename we generated ourselves
 * (e.g. "Merged Document.pdf"), what Content-Type should the download
 * response use? Extend this map as new tools produce new output types
 * (a .zip from Split, for instance).
 */
const EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
};

export function getMimeTypeForFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return EXTENSION_TO_MIME_TYPE[ext] ?? "application/octet-stream";
}
