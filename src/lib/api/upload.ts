import axios from "axios";

import { apiClient } from "../api-client";
import type { ApiSuccessBody, UploadedFileResponse } from "./types";

/**
 * Uploads a single file and reports progress as it streams. Every tool
 * page follows the same first step — attach a file, get back an id — so
 * this is the one place that logic lives. Same signature/return type as
 * before; only the internals changed (Vercel functions have no persistent
 * disk and a small request-body limit, so the file no longer goes through
 * our server at all — the browser uploads it directly to Supabase Storage
 * via a signed URL):
 *
 * 1. `POST /api/upload/sign` — validates type/size, returns a signed
 *    Storage upload URL.
 * 2. The browser `PUT`s the file bytes directly to that URL.
 * 3. `POST /api/upload/complete` — re-verifies the file server-side and
 *    returns the same `UploadedFileResponse` shape every caller expects.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadedFileResponse> {
  const signResponse = await apiClient.post<ApiSuccessBody<{ id: string; uploadUrl: string }>>("/upload/sign", {
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
  });
  const { id, uploadUrl } = signResponse.data.data;

  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      // The sign+complete round-trips are comparatively instant — the PUT
      // is where the actual bytes move, so it alone drives the 0-100 bar.
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  const completeResponse = await apiClient.post<ApiSuccessBody<UploadedFileResponse>>("/upload/complete", {
    id,
    originalName: file.name,
    mimeType: file.type,
  });

  return completeResponse.data.data;
}
