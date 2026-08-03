import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function convertPdfToWord(fileId: string): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/pdf-to-word", {
    fileId,
  });
  return response.data.data;
}
