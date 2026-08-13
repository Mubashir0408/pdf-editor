import fs from "node:fs/promises";
import path from "node:path";

import { uploadGeneratedObject, getGeneratedSignedUrl, removeUploadObject } from "../storage";
import { getMimeTypeForFilename } from "../fileValidator";
import { generateStoredFileName } from "../pathHelpers";
import type { ProcessedFileDto } from "../api-types";

interface SaveProcessedFileParams {
  tool: string;
  outputName: string;
  bytes: Uint8Array;
}

/**
 * Replaces the old Express backend's `download.service.ts`. Same public
 * method names/signatures (`save`, `deleteQuietly`) so every tool service
 * that depends on this class needs zero changes — only `streamToResponse`
 * is gone, since downloads are now served via a signed Storage URL redirect
 * (see `src/app/api/download/[id]/route.ts`) instead of proxying bytes
 * through a serverless function.
 */
export class DownloadService {
  async save(params: SaveProcessedFileParams): Promise<ProcessedFileDto> {
    const storedName = generateStoredFileName(params.outputName);
    await uploadGeneratedObject(storedName, params.bytes, getMimeTypeForFilename(params.outputName));

    return {
      id: storedName,
      tool: params.tool,
      outputName: params.outputName,
      size: params.bytes.byteLength,
      // Relative to the frontend's API base path (`/api`) — see
      // `src/lib/api-client.ts`'s `buildDownloadUrl`, which prepends it.
      // Kept prefix-free here (not `/api/download/...`) so that
      // concatenation doesn't double up.
      downloadUrl: `/download/${storedName}?name=${encodeURIComponent(params.outputName)}`,
      createdAt: new Date().toISOString(),
    };
  }

  async getSignedDownloadUrl(id: string, displayName: string | undefined): Promise<string> {
    return getGeneratedSignedUrl(id, displayName ?? id);
  }

  /** `filePaths` are the local `/tmp` paths `resolveUploadedFilePath`
   *  returned — the corresponding Storage object's key is just that path's
   *  basename (fileIds never contain a path separator), so this cleans up
   *  both the temp file and the source Storage object it came from. */
  async deleteQuietly(filePaths: string[], onError: (filePath: string, err: unknown) => void): Promise<void> {
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          await removeUploadObject(path.basename(filePath));
          await fs.unlink(filePath).catch(() => undefined);
        } catch (err) {
          onError(filePath, err);
        }
      })
    );
  }
}
