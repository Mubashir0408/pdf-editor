import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow } from "@/lib/server/validate";
import { ApiError } from "@/lib/server/ApiError";
import { featureParamSchema } from "@/lib/server/validators/usage.validator";
import { supabaseService } from "@/lib/server/supabase.service";
import { getOrCreateGuestId } from "@/lib/server/guestId";
import { FEATURE_LABELS, GUEST_FREE_USES } from "@/lib/server/features";

/**
 * Check-in endpoint for features with no dedicated backend processing step
 * (Convert, Compress, OCR are client-side simulations — see the migration
 * plan) — this request *is* the operation from a usage-limit perspective.
 * Mirrors the old Express `usage.controller.ts`'s `checkInUsage`.
 */
export const POST = apiHandler(async (req, { params }: { params: Promise<{ feature: string }> }) => {
  const { feature } = parseOrThrow(featureParamSchema, await params, "path parameters");

  if (!supabaseService.isConfigured) {
    return sendSuccess({ authenticated: false, remaining: null }, "Usage recorded");
  }

  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : undefined;
  const userId = await supabaseService.verifyToken(token);

  if (userId) {
    await supabaseService.incrementUsage("user", userId, feature);
    return sendSuccess({ authenticated: true, remaining: null }, "Usage recorded");
  }

  const guestId = await getOrCreateGuestId();
  const count = await supabaseService.getUsageCount("guest", guestId, feature);

  if (count >= GUEST_FREE_USES) {
    throw ApiError.tooManyRequests(
      `You've used your ${GUEST_FREE_USES} free uses for ${FEATURE_LABELS[feature]}. Sign in to continue with unlimited access.`
    );
  }

  await supabaseService.incrementUsage("guest", guestId, feature);
  const remaining = Math.max(0, GUEST_FREE_USES - (count + 1));

  return sendSuccess({ authenticated: false, remaining }, "Usage recorded");
});
