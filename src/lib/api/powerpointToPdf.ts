import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function convertPowerpointToPdf(fileId: string): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/powerpoint-to-pdf", {
    fileId,
  });
  return response.data.data;
}
