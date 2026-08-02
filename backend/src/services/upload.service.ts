import path from "node:path";
import type { PrismaClient } from "@prisma/client";

import { toUploadedFileDto } from "./file.service";
import type { UploadedFileDto } from "../types/file";

export class UploadService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Persists metadata for a file Multer has already validated and written
   * to disk. This never touches the file system itself — that's Multer's
   * job — it only records what happened.
   */
  async recordUpload(file: Express.Multer.File): Promise<UploadedFileDto> {
    const created = await this.prisma.uploadedFile.create({
      data: {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        size: file.size,
      },
    });

    return toUploadedFileDto(created);
  }
}
