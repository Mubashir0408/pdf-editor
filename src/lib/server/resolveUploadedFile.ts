import { downloadUploadToTempFile } from "./storage";

/**
 * Replaces the old Express backend's `resolveUploadedFile.ts` (which
 * joined a fileId onto a local `uploadDir`). Same name, same signature,
 * same return type (`Promise<string>`, a filesystem path) — every tool
 * service that calls this keeps working unmodified; only the
 * implementation moved from local disk to Supabase Storage + `/tmp`.
 */
export async function resolveUploadedFilePath(fileId: string): Promise<string> {
  return downloadUploadToTempFile(fileId);
}

export async function resolveManyUploadedFilePaths(fileIds: string[]): Promise<string[]> {
  return Promise.all(fileIds.map((id) => resolveUploadedFilePath(id)));
}
