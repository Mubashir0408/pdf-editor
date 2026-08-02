import type { UploadStatus } from "@prisma/client";

/**
 * The shape returned to API clients. Deliberately narrower than the Prisma
 * model — `storedName` (the on-disk filename) is an internal implementation
 * detail and is never exposed.
 */
export interface UploadedFileDto {
  id: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  status: UploadStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The shape returned for a tool's output. `downloadUrl` is a relative path
 * (`/download/:id`) rather than `outputPath` — where the file actually
 * lives on disk is exactly the kind of detail an API response should
 * never expose.
 */
export interface ProcessedFileDto {
  id: string;
  tool: string;
  outputName: string;
  size: number;
  downloadUrl: string;
  createdAt: Date;
}
