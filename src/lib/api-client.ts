import axios from "axios";

import { getSupabaseClient } from "@/lib/supabase/client";

/**
 * The one axios instance every API call in the app goes through. The API
 * now lives in this same Next.js app (`src/app/api/*`) rather than a
 * separate backend, so every call is same-origin — `baseURL` is just the
 * `/api` prefix, no external origin or `NEXT_PUBLIC_API_URL` needed.
 *
 * `withCredentials` lets the guest-id cookie (see
 * `src/lib/server/guestId.ts`) round-trip with every request.
 */
export const apiClient = axios.create({
  baseURL: "/api",
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

