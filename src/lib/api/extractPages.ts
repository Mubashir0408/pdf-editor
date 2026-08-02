import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function extractPages(fileId: string, pages: number[]): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/extract-pages", {
    fileId,
    pages,
  });
  return response.data.data;
}
