import path from "node:path";
import { z } from "zod";

import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { storedFileIdSchema } from "@/lib/server/validators/common.validator";
import { downloadUploadBuffer, removeUploadObject } from "@/lib/server/storage";
import { verifyFileContentMatchesExtension } from "@/lib/server/utils/verifyFileContent";
import { logger } from "@/lib/server/logger";
import type { UploadedFileDto } from "@/lib/server/api-types";

const completeBodySchema = z.object({
  id: storedFileIdSchema,
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
});

/**
 * Step 2 of the new upload flow: after the browser's direct PUT to Storage
 * finishes, this downloads the object back (magic-byte verification needs
 * the real bytes, not client-supplied labels — same defense the old
 * Multer-based flow had via `verifyFileContentMatchesExtension`) and
 * returns the same `UploadedFileDto` shape the frontend already expects.
 */
export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(completeBodySchema, await readJsonBody(req), "request body");

  const buffer = await downloadUploadBuffer(body.id);

  try {
    await verifyFileContentMatchesExtension(buffer, path.extname(body.id));
  } catch (err) {
    await removeUploadObject(body.id).catch((cleanupErr) => {
      logger.warn({ id: body.id, err: cleanupErr }, "Failed to clean up a rejected upload");
    });
    throw err;
  }

  const now = new Date().toISOString();
  const uploaded: UploadedFileDto = {
    id: body.id,
    originalName: body.originalName,
    mimeType: body.mimeType,
    extension: path.extname(body.originalName).toLowerCase(),
    size: buffer.byteLength,
    status: "UPLOADED",
    createdAt: now,
    updatedAt: now,
  };

  logger.info({ fileId: uploaded.id, mimeType: uploaded.mimeType, size: uploaded.size }, "File uploaded");

  return sendSuccess(uploaded, "File uploaded successfully", 201);
});
