/**
 * There's no persistence layer — every "record" here is computed at
 * request time from a Multer file or from bytes a tool just produced, not
 * read back out of storage. `UPLOADED` is the only status that can ever
 * exist: if a file failed validation, the request fails outright instead
 * of a status field ever describing that state.
 */
export type UploadStatus = "UPLOADED";

/**
 * The shape returned to API clients for a just-uploaded file. `id` is the
 * generated on-disk filename (`<uuid>.<ext>`) — safe to expose since it's
 * random and carries no information about the original file, and it's
 * exactly what a later `/merge` (or other tool) call references.
 */
export interface UploadedFileDto {
  id: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  status: UploadStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * The shape returned for a tool's output. `downloadUrl` is a relative path
 * (`/download/:id`) rather than the on-disk path — where the file actually
 * lives on disk is exactly the kind of detail an API response should
 * never expose.
 */
export interface ProcessedFileDto {
  id: string;
  tool: string;
  outputName: string;
  size: number;
  downloadUrl: string;
  createdAt: string;
}
