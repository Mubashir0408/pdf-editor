import fs from "node:fs/promises";
import path from "node:path";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

/**
 * Every tool service resolves a client-supplied file id to a path the same
 * way: join it onto `uploadDir` (safe because the id is already validated
 * upstream to match our own generated-filename shape — see
 * common.validator.ts) and confirm it's actually still there. One place
 * for this instead of each of the seven tool services reimplementing it.
 */
export async function resolveUploadedFilePath(fileId: string, label = "Uploaded file"): Promise<string> {
  const filePath = path.join(env.uploadDir, fileId);

  try {
    await fs.access(filePath, fs.constants.R_OK);
  } catch {
    throw ApiError.notFound(
      `${label} was not found. It may have expired — please re-upload and try again.`
    );
  }

  return filePath;
}

export async function resolveManyUploadedFilePaths(fileIds: string[]): Promise<string[]> {
  return Promise.all(
    fileIds.map((id, i) => resolveUploadedFilePath(id, `Uploaded file ${i + 1}`))
  );
}
