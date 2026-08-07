import { apiClient } from "../api-client";
import type { ApiSuccessBody, ChatResponse } from "./types";

/**
 * Sends a message to `POST /chat`. `fileId` is the id an already-uploaded
 * PDF got back from `uploadFile` — when present, the backend grounds the
 * answer in that document's extracted text; when omitted, it's a plain
 * conversational request.
 */
export async function sendChatMessage(message: string, fileId?: string): Promise<ChatResponse> {
  const response = await apiClient.post<ApiSuccessBody<ChatResponse>>("/chat", {
    message,
    ...(fileId ? { fileId } : {}),
  });
  return response.data.data;
}
