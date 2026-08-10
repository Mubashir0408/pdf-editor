import axios from "axios";

import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * The one axios instance every API call in the app goes through. Centralizing
 * the base URL here means every tool page that talks to the backend (merge
 * now, more to come) reuses the exact same client instead of each hardcoding
 * `process.env.NEXT_PUBLIC_API_URL`.
 *
 * `withCredentials` lets the backend's guest-id cookie (see
 * `guestId.middleware.ts`) round-trip — without it the browser would never
 * send/store that cookie across the cross-port dev origins.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  withCredentials: true,
});

/** Attaches the current Supabase session's access token, when one exists,
 *  so the backend can recognize signed-in requests and bypass the guest
 *  usage limit. A no-op (and harmless) when Supabase isn't configured or
 *  nobody is signed in — those requests are just sent as guest requests. */
apiClient.interceptors.request.use(async (config) => {
  const supabase = getSupabaseClient();
  if (!supabase) return config;

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

export const API_BASE_URL = apiClient.defaults.baseURL as string;

/** Turns the relative `downloadUrl` a processing endpoint returns
 *  (e.g. `/download/abc123`) into an absolute URL the browser can navigate
 *  to directly. */
export function buildDownloadUrl(relativeUrl: string): string {
  return `${API_BASE_URL}${relativeUrl}`;
}

