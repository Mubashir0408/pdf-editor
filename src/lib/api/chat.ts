import { apiClient } from "../api-client";
import type { ApiSuccessBody, ChatResponse } from "./types";

/**
 * Sends a message to the AI Chat backend, optionally grounded in a
 * previously-uploaded PDF (`fileId` from `uploadFile`). The backend calls
 * OpenRouter server-side — no provider key or call ever touches the
 * browser.
 */
export async function sendChatMessage(message: string, fileId?: string): Promise<ChatResponse> {
  const response = await apiClient.post<ApiSuccessBody<ChatResponse>>("/chat", {
    message,
    ...(fileId ? { fileId } : {}),
  });
  return response.data.data;
}
