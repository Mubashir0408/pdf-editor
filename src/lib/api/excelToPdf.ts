import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function convertExcelToPdf(fileId: string): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/excel-to-pdf", {
    fileId,
  });
  return response.data.data;
}
