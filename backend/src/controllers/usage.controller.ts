import type { Request, Response } from "express";

import { supabaseService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { FEATURE_LABELS, GUEST_FREE_USES } from "../constants/features";
import type { FeatureParam } from "../validators/usage.validator";

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
}

/** Read-only: how many free uses this guest has left for a feature (or
 *  "unlimited" for a signed-in user). Never increments — used by the
 *  frontend to show "N free uses remaining" before the user does anything. */
export const getUsageStatus = asyncHandler(async (req: Request, res: Response) => {
  const { feature } = req.params as unknown as FeatureParam;

  if (!supabaseService.isConfigured) {
    sendSuccess(res, { authenticated: false, remaining: null, limit: GUEST_FREE_USES }, "Usage status");
    return;
  }

  const userId = await supabaseService.verifyToken(extractBearerToken(req));
  if (userId) {
    sendSuccess(res, { authenticated: true, remaining: null, limit: null }, "Usage status");
    return;
  }

  const guestId = req.guestId as string;
  const count = await supabaseService.getUsageCount("guest", guestId, feature);
  const remaining = Math.max(0, GUEST_FREE_USES - count);

  sendSuccess(res, { authenticated: false, remaining, limit: GUEST_FREE_USES }, "Usage status");
});

/**
 * Check-in endpoint for features with no dedicated backend processing step
 * (Convert, Compress, OCR are client-side simulations) — this request *is*
 * the operation from a usage-limit perspective, so it checks the guest
 * limit and increments in one step rather than needing a `res.on("finish")`
 * hook the way `usage.middleware.ts` does for the real tool routes.
 */
export const checkInUsage = asyncHandler(async (req: Request, res: Response) => {
  const { feature } = req.params as unknown as FeatureParam;

  if (!supabaseService.isConfigured) {
    sendSuccess(res, { authenticated: false, remaining: null }, "Usage recorded");
    return;
  }

  const userId = await supabaseService.verifyToken(extractBearerToken(req));
  if (userId) {
    await supabaseService.incrementUsage("user", userId, feature);
    sendSuccess(res, { authenticated: true, remaining: null }, "Usage recorded");
    return;
  }

  const guestId = req.guestId as string;
  const count = await supabaseService.getUsageCount("guest", guestId, feature);

  if (count >= GUEST_FREE_USES) {
    throw ApiError.tooManyRequests(
      `You've used your ${GUEST_FREE_USES} free uses for ${FEATURE_LABELS[feature]}. Sign in to continue with unlimited access.`
    );
  }

  await supabaseService.incrementUsage("guest", guestId, feature);
  const remaining = Math.max(0, GUEST_FREE_USES - (count + 1));

  sendSuccess(res, { authenticated: false, remaining }, "Usage recorded");
});
