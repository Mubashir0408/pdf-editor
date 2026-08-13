import { supabaseService } from "./supabase.service";
import { getOrCreateGuestId } from "./guestId";
import { ApiError } from "./ApiError";
import { FEATURE_LABELS, GUEST_FREE_USES, type FeatureKey } from "./features";

export type UsageSubject = { type: "user"; id: string } | { type: "guest"; id: string } | null;

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
}

/**
 * Call at the top of a protected route handler — replaces the old Express
 * `enforceUsage(feature)` middleware array. Throws `ApiError.tooManyRequests`
 * if a guest has exhausted their free uses; otherwise returns the subject to
 * pass to `recordUsage` after the operation succeeds. Returns `null` when
 * Supabase isn't configured (unmetered, same fail-open behavior as before).
 */
export async function enforceUsage(req: Request, feature: FeatureKey): Promise<UsageSubject> {
  if (!supabaseService.isConfigured) return null;

  const userId = await supabaseService.verifyToken(extractBearerToken(req));
  if (userId) return { type: "user", id: userId };

  const guestId = await getOrCreateGuestId();
  const count = await supabaseService.getUsageCount("guest", guestId, feature);

  if (count >= GUEST_FREE_USES) {
    throw ApiError.tooManyRequests(
      `You've used your ${GUEST_FREE_USES} free uses for ${FEATURE_LABELS[feature]}. Sign in to continue with unlimited access.`
    );
  }

  return { type: "guest", id: guestId };
}

/** Call only after the operation actually succeeds — a failed request must
 *  never count against the limit. */
export async function recordUsage(subject: UsageSubject, feature: FeatureKey): Promise<void> {
  if (!subject) return;
  await supabaseService.incrementUsage(subject.type, subject.id, feature);
}
