import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function convertPdfToImage(
  fileId: string,
  format: "png" | "jpg" = "png"
): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/pdf-to-image", {
    fileId,
    format,
  });
  return response.data.data;
}
