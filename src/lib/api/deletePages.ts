import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function deletePages(fileId: string, pages: number[]): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/delete-pages", {
    fileId,
    pages,
  });
  return response.data.data;
}
