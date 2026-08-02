import { apiClient } from "../api-client";
import type { ApiSuccessBody, UploadedFileResponse } from "./types";

/**
 * Uploads a single file to `POST /upload` and reports progress as it
 * streams. Every tool page follows the same first step — attach a file,
 * get back an id — so this is the one place that logic lives.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadedFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ApiSuccessBody<UploadedFileResponse>>(
    "/upload",
    formData,
    {
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    }
  );

  return response.data.data;
}
