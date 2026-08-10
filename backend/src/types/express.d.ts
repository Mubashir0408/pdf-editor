import type { UsageOwnerType } from "../services/supabase.service";

declare global {
  namespace Express {
    interface Request {
      /** Set by `guestId.middleware.ts` on every request that passes through it. */
      guestId?: string;
      /** Set by `usage.middleware.ts` once identity (guest vs. signed-in user) is resolved. */
      usageSubject?: { type: UsageOwnerType; id: string };
    }
  }
}

export {};
