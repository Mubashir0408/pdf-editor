import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Creates `dir` (and any missing parent folders) if it doesn't already
 * exist. Safe to call on every startup — `recursive: true` makes it a no-op
 * when the directory is already there, on both Windows and POSIX.
 */
export function ensureDirSync(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Generates a collision-proof on-disk filename that preserves the original
 * extension. The original filename is never used to build a file system
 * path, which rules out path-traversal via a crafted `originalName`
 * (e.g. `../../etc/passwd`) by construction rather than by sanitization.
 */
export function generateStoredFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return `${randomUUID()}${ext}`;
}
