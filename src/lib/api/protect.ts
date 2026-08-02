import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse } from "./types";

export interface ProtectRequest {
  fileId: string;
  password: string;
  confirmPassword: string;
  allowPrinting: boolean;
  allowCopying: boolean;
}

export async function protectPdf(request: ProtectRequest): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/protect", request);
  return response.data.data;
}
