import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Generates a collision-proof storage object key that preserves the
 * original extension. The original filename is never used to build the
 * key, which rules out path-traversal via a crafted `originalName` by
 * construction rather than by sanitization.
 */
export function generateStoredFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}
