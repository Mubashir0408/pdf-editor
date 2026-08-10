import type { NextFunction, Request, RequestHandler, Response } from "express";

import { supabaseService } from "../services";
import { guestIdMiddleware } from "./guestId.middleware";
import { ApiError } from "../utils/ApiError";
import { FEATURE_LABELS, GUEST_FREE_USES, type FeatureKey } from "../constants/features";

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
}

/**
 * Wraps a tool route so it enforces the guest free-use limit and records
 * usage for signed-in users — without the route's own controller/service
 * needing to know anything about auth or limits. A valid Supabase access
 * token always bypasses the limit entirely. Usage is only ever recorded
 * after the wrapped handler actually succeeds (`res.on("finish")`, status
 * < 400): a rejected or failed request never counts against the limit.
 *
 * If Supabase isn't configured yet (no `SUPABASE_URL`/
 * `SUPABASE_SERVICE_ROLE_KEY`), every request passes through unmetered —
 * identical to how this route behaved before this feature existed —
 * rather than blocking every guest because setup isn't finished.
 */
export function enforceUsage(feature: FeatureKey): RequestHandler[] {
  return [
    guestIdMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      if (!supabaseService.isConfigured) {
        next();
        return;
      }

      try {
        const userId = await supabaseService.verifyToken(extractBearerToken(req));

        if (userId) {
          req.usageSubject = { type: "user", id: userId };
          res.on("finish", () => {
            if (res.statusCode < 400) void supabaseService.incrementUsage("user", userId, feature);
          });
          next();
          return;
        }

        const guestId = req.guestId as string;
        const count = await supabaseService.getUsageCount("guest", guestId, feature);

        if (count >= GUEST_FREE_USES) {
          throw ApiError.tooManyRequests(
            `You've used your ${GUEST_FREE_USES} free uses for ${FEATURE_LABELS[feature]}. Sign in to continue with unlimited access.`
          );
        }

        req.usageSubject = { type: "guest", id: guestId };
        res.on("finish", () => {
          if (res.statusCode < 400) void supabaseService.incrementUsage("guest", guestId, feature);
        });
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}
