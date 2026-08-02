import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export async function rotatePdf(
  fileId: string,
  rotations: Record<string, number>
): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/rotate", {
    fileId,
    rotations,
  });
  return response.data.data;
}
