import fs from "node:fs";
import path from "node:path";
import type { PrismaClient, ProcessedFile } from "@prisma/client";
import type { Response } from "express";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { generateStoredFileName } from "../utils/pathHelpers";
import { getMimeTypeForFilename } from "../utils/fileValidator";
import type { ProcessedFileDto } from "../types/file";

export function toProcessedFileDto(file: ProcessedFile): ProcessedFileDto {
  return {
    id: file.id,
    tool: file.tool,
    outputName: file.outputName,
    size: file.size,
    downloadUrl: `/download/${file.id}`,
    createdAt: file.createdAt,
  };
}

interface SaveProcessedFileParams {
  tool: string;
  outputName: string;
  bytes: Uint8Array;
  sourceFileIds: string[];
}

/**
 * The counterpart to UploadService: instead of accepting a file a client
 * sent us, this persists a file *we* generated (a merged PDF, eventually a
 * split zip, ...) — writing it under generated/, recording it, and later
 * serving it back out. Every tool milestone ends by calling `save()` here.
 */
export class DownloadService {
  constructor(private readonly prisma: PrismaClient) {}

  async save(params: SaveProcessedFileParams): Promise<ProcessedFileDto> {
    const storedName = generateStoredFileName(params.outputName);
    const destination = path.join(env.generatedDir, storedName);

    await fs.promises.writeFile(destination, params.bytes);

    const created = await this.prisma.processedFile.create({
      data: {
        tool: params.tool,
        outputName: params.outputName,
        outputPath: storedName,
        size: params.bytes.byteLength,
        sourceFileIds: params.sourceFileIds,
      },
    });

    return toProcessedFileDto(created);
  }

  /**
   * Streams a previously generated file to the client as an attachment.
   * Writes headers and pipes directly from disk rather than buffering the
   * whole file in memory — merged PDFs can be large.
   */
  async streamToResponse(id: string, res: Response): Promise<void> {
    const file = await this.prisma.processedFile.findUnique({ where: { id } });

    if (!file) {
      throw ApiError.notFound(`No generated file found with id "${id}".`);
    }

    const filePath = path.join(env.generatedDir, file.outputPath);

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
    } catch {
      throw ApiError.notFound("This file is no longer available for download.");
    }

    res.setHeader("Content-Type", getMimeTypeForFilename(file.outputName));
    res.setHeader("Content-Length", file.size);
    res.setHeader("Content-Disposition", buildContentDisposition(file.outputName));

    await new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      stream.on("error", reject);
      stream.on("close", resolve);
      stream.pipe(res);
    });
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
