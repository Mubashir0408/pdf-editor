import { apiClient } from "../api-client";
import type { FeatureKey } from "../features";
import type { ApiSuccessBody } from "./types";

export interface UsageStatus {
  authenticated: boolean;
  /** `null` for a signed-in user (unlimited) or when Supabase isn't configured yet. */
  remaining: number | null;
  limit?: number | null;
}

/** Read-only: how many free uses of `feature` this guest (or "unlimited"
 *  for a signed-in user) has left. Never counts as a use. */
export async function getUsageStatus(feature: FeatureKey): Promise<UsageStatus> {
  const response = await apiClient.get<ApiSuccessBody<UsageStatus>>(`/usage/${feature}`);
  return response.data.data;
}

/** Check-in for features with no dedicated backend processing step
 *  (Convert, Compress, OCR) — this call itself is "the use": it enforces
 *  the guest limit and records it in one step. Throws (via axios) the same
 *  429 a real tool route would if the guest is already at the limit. */
export async function checkInUsage(feature: FeatureKey): Promise<UsageStatus> {
  const response = await apiClient.post<ApiSuccessBody<UsageStatus>>(`/usage/${feature}/check`);
  return response.data.data;
}
