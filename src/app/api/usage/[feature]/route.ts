import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow } from "@/lib/server/validate";
import { featureParamSchema } from "@/lib/server/validators/usage.validator";
import { supabaseService } from "@/lib/server/supabase.service";
import { getOrCreateGuestId } from "@/lib/server/guestId";
import { GUEST_FREE_USES } from "@/lib/server/features";

function extractBearerToken(req: Request): string | undefined {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length).trim();
}

/** Read-only — never increments. Mirrors the old Express
 *  `usage.controller.ts`'s `getUsageStatus`. */
export const GET = apiHandler(async (req, { params }: { params: Promise<{ feature: string }> }) => {
  const { feature } = parseOrThrow(featureParamSchema, await params, "path parameters");

  if (!supabaseService.isConfigured) {
    return sendSuccess({ authenticated: false, remaining: null, limit: GUEST_FREE_USES }, "Usage status");
  }

  const userId = await supabaseService.verifyToken(extractBearerToken(req));
  if (userId) {
    return sendSuccess({ authenticated: true, remaining: null, limit: null }, "Usage status");
  }

  const guestId = await getOrCreateGuestId();
  const count = await supabaseService.getUsageCount("guest", guestId, feature);
  const remaining = Math.max(0, GUEST_FREE_USES - count);

  return sendSuccess({ authenticated: false, remaining, limit: GUEST_FREE_USES }, "Usage status");
});
