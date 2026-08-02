import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse, SplitRequest } from "./types";

export async function splitPdf(request: SplitRequest): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/split", request);
  return response.data.data;
}
