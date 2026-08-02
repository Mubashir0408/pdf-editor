import { isAxiosError } from "axios";

import type { ApiErrorBody } from "./types";

/**
 * Pulls a friendly message out of a failed API call. The backend always
 * responds with `{ success: false, message, errors: [...] }` — this reads
 * that shape when present, and falls back to something reasonable for
 * network failures or anything else unexpected, so every tool page can
 * show a real error message instead of "[object Object]".
 */
export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;
    if (body?.message) {
      const fieldErrors = body.errors
        ?.map((e) => e.message)
        .filter(Boolean)
        .join(" ");
      return fieldErrors ? `${body.message}: ${fieldErrors}` : body.message;
    }
    if (error.code === "ERR_NETWORK") {
      return "Couldn't reach the server. Is the backend running?";
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
