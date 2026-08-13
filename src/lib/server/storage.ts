import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";
import { ApiError } from "./ApiError";
import { logger } from "./logger";

/**
 * Replaces the old Express backend's local `uploads/`/`generated/`
 * directories — Vercel serverless functions have no persistent local disk
 * shared across requests, so source and output files now live in two
 * private Supabase Storage buckets (must be created once in the Supabase
 * dashboard: `uploads`, `generated`).
 */
const UPLOADS_BUCKET = "uploads";
const GENERATED_BUCKET = "generated";

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!cachedClient) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw ApiError.serviceUnavailable("File storage is not configured on the server.");
    }
    cachedClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cachedClient;
}

/** Used by `POST /api/upload/sign` — the browser PUTs bytes directly to
 *  this URL, bypassing Vercel's function body-size limit entirely. */
export async function createSignedUploadUrl(objectKey: string): Promise<string> {
  const { data, error } = await getClient().storage.from(UPLOADS_BUCKET).createSignedUploadUrl(objectKey);
  if (error || !data) {
    logger.error({ err: error, objectKey }, "Failed to create a signed upload URL");
    throw ApiError.internal("Couldn't prepare the upload. Please try again.");
  }
  return data.signedUrl;
}

/** Used by `POST /api/upload/complete` to re-verify what actually landed in
 *  Storage (real size/content), rather than trusting client-supplied
 *  metadata. */
export async function downloadUploadBuffer(objectKey: string): Promise<Buffer> {
  const { data, error } = await getClient().storage.from(UPLOADS_BUCKET).download(objectKey);
  if (error || !data) {
    logger.error({ err: error, objectKey }, "Failed to download an uploaded object");
    throw ApiError.notFound("Uploaded file was not found. It may have expired — please re-upload and try again.");
  }
  return Buffer.from(await data.arrayBuffer());
}

/**
 * Downloads a previously uploaded object to a local temp file and returns
 * its path — every tool service's `PdfService`/`PdfEncryptionService`/etc.
 * method signature already takes a filesystem path (`fs.readFile(inputPath)`
 * internally), so this lets every one of those services move over
 * unmodified: they just read from `/tmp` instead of a persistent `uploads/`
 * directory. `/tmp` is writable but ephemeral on Vercel — valid only for the
 * lifetime of the invocation that wrote it, which is exactly how long each
 * tool route needs it for.
 */
export async function downloadUploadToTempFile(objectKey: string): Promise<string> {
  const buffer = await downloadUploadBuffer(objectKey);
  const tempPath = path.join(os.tmpdir(), objectKey.replace(/[/\\]/g, "_"));
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

export async function removeUploadObject(objectKey: string): Promise<void> {
  await getClient().storage.from(UPLOADS_BUCKET).remove([objectKey]);
}

export async function uploadGeneratedObject(objectKey: string, bytes: Uint8Array, contentType: string): Promise<void> {
  const { error } = await getClient()
    .storage.from(GENERATED_BUCKET)
    .upload(objectKey, bytes, { contentType, upsert: false });
  if (error) {
    logger.error({ err: error, objectKey }, "Failed to upload a generated object");
    throw ApiError.internal("Couldn't save the processed file. Please try again.");
  }
}

/** Downloads a generated object's bytes directly, for `/api/download/[id]`
 *  to serve itself instead of redirecting the browser to a cross-origin
 *  Supabase URL — avoids the `<a download>` attribute being dropped (and
 *  any other cross-origin-redirect quirk) on the final download click. */
export async function downloadGeneratedBuffer(objectKey: string): Promise<Buffer> {
  const { data, error } = await getClient().storage.from(GENERATED_BUCKET).download(objectKey);
  if (error || !data) {
    logger.error({ err: error, objectKey }, "Failed to download a generated object");
    throw ApiError.notFound("This file is no longer available for download.");
  }
  return Buffer.from(await data.arrayBuffer());
}

/** Used by the cron cleanup route — mirrors the old `tempFileCleanup.ts`
 *  age-based sweep, just against Storage instead of a local directory. */
export async function removeOldObjects(bucket: "uploads" | "generated", maxAgeMs: number): Promise<number> {
  const { data, error } = await getClient().storage.from(bucket).list(undefined, { limit: 1000 });
  if (error || !data) return 0;

  const now = Date.now();
  const stale = data.filter((entry) => {
    const created = entry.created_at ? new Date(entry.created_at).getTime() : 0;
    return created > 0 && now - created > maxAgeMs;
  });
  if (stale.length === 0) return 0;

  await getClient()
    .storage.from(bucket)
    .remove(stale.map((entry) => entry.name));
  return stale.length;
}
