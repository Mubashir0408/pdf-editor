import { ApiError } from "./ApiError";

/**
 * Multer's `fileFilter` only checks the extension and the browser-supplied
 * `Content-Type` — both are just labels the client attaches to the upload
 * and neither is verified against what the file actually contains. This
 * inspects the file's real magic bytes (via `file-type`, ESM-only hence the
 * dynamic import) and confirms they match what the extension claims,
 * catching a renamed/disguised file (e.g. a script saved as `.pdf`) that
 * would otherwise sail through the earlier, label-only check.
 *
 * `file-type` ships types, but as an ESM-only package its `.d.ts` isn't
 * resolvable under this project's `moduleResolution: "Node"` for a dynamic
 * import target — this hand-written shape covers only the one function
 * used here, the same workaround already used for pdfjs-dist.
 */
interface FileTypeModule {
  fileTypeFromFile(path: string): Promise<{ ext: string; mime: string } | undefined>;
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

export async function verifyFileContentMatchesExtension(filePath: string, extension: string): Promise<void> {
  const expected = EXTENSION_TO_EXPECTED_MIME[extension.toLowerCase()];
  if (!expected) return;

  // @ts-expect-error — ESM-only package; its types aren't resolvable for a
  // dynamic import target under this project's moduleResolution ("Node").
  const fileTypeModule = (await import("file-type")) as unknown as FileTypeModule;
  const detected = await fileTypeModule.fileTypeFromFile(filePath);

  if (!detected || !expected.includes(detected.mime)) {
    throw ApiError.unsupportedMediaType(
      "This file's content doesn't match its extension. It may be corrupted or disguised as a different file type."
    );
  }
}
