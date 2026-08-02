import { apiClient } from "../api-client";
import type { ApiSuccessBody, PdfInfoResponse } from "./types";

/** Real page count for a previously-uploaded PDF — used by every tool page
 *  with a page-selection grid (Split, Rotate, Extract, Delete) instead of
 *  guessing. */
export async function getPdfInfo(fileId: string): Promise<PdfInfoResponse> {
  const response = await apiClient.get<ApiSuccessBody<PdfInfoResponse>>(`/pdf-info/${fileId}`);
  return response.data.data;
}
