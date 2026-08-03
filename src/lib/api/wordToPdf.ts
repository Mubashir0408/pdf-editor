import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function convertWordToPdf(fileId: string): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/word-to-pdf", {
    fileId,
  });
  return response.data.data;
}
