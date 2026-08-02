import fs from "node:fs";
import path from "node:path";
import type { Response } from "express";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { generateStoredFileName } from "../utils/pathHelpers";
import { getMimeTypeForFilename } from "../utils/fileValidator";
import type { ProcessedFileDto } from "../types/file";

interface SaveProcessedFileParams {
  tool: string;
  outputName: string;
  bytes: Uint8Array;
}

/**
 * The counterpart to UploadService: instead of accepting a file a client
 * sent us, this persists a file *we* generated (a merged PDF, eventually a
 * split zip, ...) under generated/, and later serves it back out. There's
 * no database row backing any of this — `id` below *is* the generated
 * on-disk filename, and the human-friendly `outputName` travels in the
 * download URL's query string (`?name=`) rather than being looked up,
 * since nothing persists between the two requests to look it up in.
 */
export class DownloadService {
  async save(params: SaveProcessedFileParams): Promise<ProcessedFileDto> {
    const storedName = generateStoredFileName(params.outputName);
    const destination = path.join(env.generatedDir, storedName);

    await fs.promises.writeFile(destination, params.bytes);

    return {
      id: storedName,
      tool: params.tool,
      outputName: params.outputName,
      size: params.bytes.byteLength,
      downloadUrl: `/download/${storedName}?name=${encodeURIComponent(params.outputName)}`,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Streams a previously generated file to the client as an attachment.
   * `displayName` (from the download URL's `?name=` query param) is what
   * the browser's save dialog shows; it falls back to the raw id if
   * missing so this never 500s over a stripped query string.
   */
  async streamToResponse(id: string, displayName: string | undefined, res: Response): Promise<void> {
    const filePath = path.join(env.generatedDir, id);

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch {
      throw ApiError.notFound("This file is no longer available for download.");
    }

    const stat = await fs.promises.stat(filePath);
    const outputName = displayName ?? id;

    res.setHeader("Content-Type", getMimeTypeForFilename(outputName));
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Disposition", buildContentDisposition(outputName));

    await new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      stream.on("error", reject);
      stream.on("close", resolve);
      stream.pipe(res);
    });
  }

  /** Best-effort cleanup — logged, never allowed to fail the request that
   *  triggered it (the response has already succeeded by the time this
   *  runs; a stray temp file is a much smaller problem than a 500 here). */
  async deleteQuietly(filePaths: string[], onError: (filePath: string, err: unknown) => void): Promise<void> {
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          await fs.promises.unlink(filePath);
        } catch (err) {
          onError(filePath, err);
        }
      })
    );
  }
}

/**
 * RFC 5987-safe Content-Disposition: `filename` is an ASCII fallback for
 * old clients, `filename*` carries the exact UTF-8 name for everyone else
 * — needed because output names come from user-controlled input (original
 * filenames) and may contain non-ASCII characters or ones that would
 * otherwise need escaping inside the header value.
 */
function buildContentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
