import { apiClient } from "../api-client";
import type { ApiSuccessBody, TranslateJobStatus } from "./types";

export async function startTranslateJob(
  fileId: string,
  sourceLang: string,
  targetLang: string
): Promise<{ jobId: string }> {
  const response = await apiClient.post<ApiSuccessBody<{ jobId: string }>>("/translate", {
    fileId,
    sourceLang,
    targetLang,
  });
  return response.data.data;
}

export async function getTranslateJobStatus(jobId: string): Promise<TranslateJobStatus> {
  const response = await apiClient.get<ApiSuccessBody<TranslateJobStatus>>(`/translate/${jobId}`);
  return response.data.data;
}
