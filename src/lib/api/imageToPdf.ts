import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function convertImageToPdf(fileIds: string[]): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/image-to-pdf", {
    fileIds,
  });
  return response.data.data;
}
