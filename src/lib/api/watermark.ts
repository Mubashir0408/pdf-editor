import { apiClient } from "../api-client";
import type { ApiSuccessBody, ProcessedFileResponse, WatermarkPosition } from "./types";

export interface WatermarkRequest {
  fileId: string;
  text: string;
  position: WatermarkPosition;
  /** Percent, 10-100 */
  opacity: number;
  fontSize: number;
  /** Degrees */
  rotation: number;
}

export async function watermarkPdf(request: WatermarkRequest): Promise<ProcessedFileResponse> {
  const response = await apiClient.post<ApiSuccessBody<ProcessedFileResponse>>("/watermark", request);
  return response.data.data;
}
