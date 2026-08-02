import type { PrismaClient, UploadedFile } from "@prisma/client";

import { ApiError } from "../utils/ApiError";
import type { UploadedFileDto } from "../types/file";

/**
 * Maps the Prisma model to the public DTO. Centralized here so every
 * service that returns file data (this one, upload.service) shapes the
 * response identically and `storedName` — an internal on-disk detail —
 * never leaks into an API response.
 */
export function toUploadedFileDto(file: UploadedFile): UploadedFileDto {
  return {
    id: file.id,
    originalName: file.originalName,
    mimeType: file.mimeType,
    extension: file.extension,
    size: file.size,
    status: file.status,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}

export class FileService {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(id: string): Promise<UploadedFileDto> {
    const file = await this.findByIdOrThrow(id);
    return toUploadedFileDto(file);
  }

  /**
   * Internal-only: returns the full Prisma model (including `storedName`,
   * the on-disk filename), for services that need to actually read the
   * file — never expose this return value directly on an API response.
   */
  async findByIdOrThrow(id: string): Promise<UploadedFile> {
    const file = await this.prisma.uploadedFile.findUnique({ where: { id } });

    if (!file) {
      throw ApiError.notFound(`No file found with id "${id}".`);
    }

    return file;
  }

  /**
   * Internal-only: fetches multiple uploads and returns them in the exact
   * order `ids` was given (Postgres/Prisma make no such guarantee on
   * their own), which matters wherever input order is meaningful — e.g.
   * merge, where it determines page order in the output. Throws if any id
   * doesn't exist, naming the missing one.
   */
  async findManyByIdsOrThrow(ids: string[]): Promise<UploadedFile[]> {
    const found = await this.prisma.uploadedFile.findMany({
      where: { id: { in: ids } },
    });
    const byId = new Map(found.map((file) => [file.id, file]));

    return ids.map((id) => {
      const file = byId.get(id);
      if (!file) {
        throw ApiError.notFound(`No file found with id "${id}".`);
      }
      return file;
    });
  }
}
