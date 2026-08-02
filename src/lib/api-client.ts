import axios from "axios";

/**
 * The one axios instance every API call in the app goes through. Centralizing
 * the base URL here means every tool page that talks to the backend (merge
 * now, more to come) reuses the exact same client instead of each hardcoding
 * `process.env.NEXT_PUBLIC_API_URL`.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
});

export const API_BASE_URL = apiClient.defaults.baseURL as string;

/** Turns the relative `downloadUrl` a processing endpoint returns
 *  (e.g. `/download/abc123`) into an absolute URL the browser can navigate
 *  to directly. */
export function buildDownloadUrl(relativeUrl: string): string {
  return `${API_BASE_URL}${relativeUrl}`;
}

