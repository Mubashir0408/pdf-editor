import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import type { FeatureKey } from "../constants/features";

export type UsageOwnerType = "guest" | "user";

/**
 * One Supabase client, built with the service-role key — server-only,
 * bypasses RLS by design, and is the only thing in this app allowed to
 * read/write `feature_usage`. Also used to verify a signed-in user's
 * access token (`auth.getUser`), since a service-role client can validate
 * any project token, not just ones it minted itself.
 *
 * Deliberately tolerant of missing config: until `SUPABASE_URL`/
 * `SUPABASE_SERVICE_ROLE_KEY` are set, `isConfigured` is false and every
 * caller (see `usage.middleware.ts`) treats that as "skip auth/usage
 * enforcement entirely" rather than failing every request — the app must
 * keep working for guests exactly as it did before this feature existed
 * until Supabase is actually wired up.
 */
export class SupabaseService {
  private readonly client: SupabaseClient | null;

  constructor() {
    this.client =
      env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  /** Resolves a Supabase access token to a user id. Returns `null` for a
   *  missing/expired/invalid token — that's not an error, it just means
   *  this request should be treated as a guest. */
  async verifyToken(token: string | undefined): Promise<string | null> {
    if (!token || !this.client) return null;

    const { data, error } = await this.client.auth.getUser(token);
    if (error || !data.user) return null;

    return data.user.id;
  }

  async getUsageCount(ownerType: UsageOwnerType, ownerId: string, feature: FeatureKey): Promise<number> {
    if (!this.client) {
      throw ApiError.internal("Usage tracking is not configured on the server.");
    }

    const { data, error } = await this.client
      .from("feature_usage")
      .select("usage_count")
      .eq("owner_type", ownerType)
      .eq("owner_id", ownerId)
      .eq("feature", feature)
      .maybeSingle();

    if (error) {
      logger.error({ err: error, ownerType, feature }, "Failed to read feature usage");
      throw ApiError.internal("Couldn't check usage. Please try again.");
    }

    return data?.usage_count ?? 0;
  }

  /** Atomically increments (via the `increment_feature_usage` DB function —
   *  see the migration) and swallows failures rather than throwing: this
   *  always runs after the real operation already succeeded, so a
   *  bookkeeping hiccup here must never turn into a failed response. */
  async incrementUsage(ownerType: UsageOwnerType, ownerId: string, feature: FeatureKey): Promise<void> {
    if (!this.client) return;

    const { error } = await this.client.rpc("increment_feature_usage", {
      p_owner_type: ownerType,
      p_owner_id: ownerId,
      p_feature: feature,
    });

    if (error) {
      logger.error({ err: error, ownerType, feature }, "Failed to record feature usage");
    }
  }
}
