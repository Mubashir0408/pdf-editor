import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "./env";
import { logger } from "./logger";
import { ApiError } from "./ApiError";
import type { FeatureKey } from "./features";

export type UsageOwnerType = "guest" | "user";

/**
 * One Supabase client, built with the service-role key — server-only,
 * bypasses RLS by design. Ported unchanged from the old Express backend's
 * `supabase.service.ts`; this class was already framework-agnostic.
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

  /** Server-only Supabase client, for anything beyond auth/usage (e.g. the
   *  `translation_jobs` table) that doesn't warrant its own service class. */
  raw(): SupabaseClient {
    if (!this.client) {
      throw ApiError.serviceUnavailable("Supabase is not configured on the server.");
    }
    return this.client;
  }
}

export const supabaseService = new SupabaseService();
