import { z } from "zod";

import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { ApiError } from "@/lib/server/ApiError";
import { isAllowedFile } from "@/lib/server/fileValidator";
import { generateStoredFileName } from "@/lib/server/pathHelpers";
import { createSignedUploadUrl } from "@/lib/server/storage";
import { env } from "@/lib/server/env";

const signBodySchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

/**
 * Step 1 of the new upload flow (replaces Multer's disk storage). Vercel
 * functions have a small request-body limit (~4.5MB) and no persistent
 * local disk, so large files (up to the same 100MB cap as before) can't be
 * proxied through this route the way Multer did — instead this hands back
 * a Supabase Storage signed upload URL, and the browser PUTs the file
 * bytes directly to Storage, bypassing this server entirely.
 */
export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(signBodySchema, await readJsonBody(req), "request body");

  if (!isAllowedFile(body.originalName, body.mimeType)) {
    throw ApiError.unsupportedMediaType("Unsupported file type. Allowed types: PDF, DOCX, PPTX, XLSX, JPG, PNG.");
  }
  if (body.size > env.MAX_UPLOAD_SIZE) {
    throw ApiError.payloadTooLarge("File exceeds the maximum allowed size.");
  }

  const id = generateStoredFileName(body.originalName);
  const uploadUrl = await createSignedUploadUrl(id);

  return sendSuccess({ id, uploadUrl }, "Upload URL created");
});
