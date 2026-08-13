import { ApiError } from "../ApiError";

/**
 * Adapted from the old Express backend's `verifyFileContent.ts` — same
 * magic-byte check via `file-type`, now against an in-memory buffer (the
 * object just downloaded from Supabase Storage in `POST /api/upload/complete`)
 * instead of a path on local disk, since there's no local disk step anymore.
 */
interface FileTypeModule {
  fileTypeFromBuffer(buffer: Uint8Array): Promise<{ ext: string; mime: string } | undefined>;
}

const EXTENSION_TO_EXPECTED_MIME: Record<string, string[]> = {
  ".pdf": ["application/pdf"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

export async function verifyFileContentMatchesExtension(buffer: Buffer, extension: string): Promise<void> {
  const expected = EXTENSION_TO_EXPECTED_MIME[extension.toLowerCase()];
  if (!expected) return;

  const fileTypeModule = (await import("file-type")) as unknown as FileTypeModule;
  const detected = await fileTypeModule.fileTypeFromBuffer(buffer);

  if (!detected || !expected.includes(detected.mime)) {
    throw ApiError.unsupportedMediaType(
      "This file's content doesn't match its extension. It may be corrupted or disguised as a different file type."
    );
  }
}
