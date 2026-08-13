import { NextResponse } from "next/server";

import { env } from "@/lib/server/env";
import { logger } from "@/lib/server/logger";
import { removeOldObjects } from "@/lib/server/storage";

/**
 * Replaces the old Express backend's `tempFileCleanup.ts` `setInterval`
 * sweep — serverless functions have no long-running process to host a
 * timer, so this is triggered externally instead, by the Vercel Cron
 * configured in `vercel.json` (every 15 minutes, matching the old sweep's
 * cadence). Vercel signs cron requests with a bearer token checked against
 * `CRON_SECRET` so this can't be triggered by anyone else.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const [uploadsDeleted, generatedDeleted] = await Promise.all([
    removeOldObjects("uploads", env.TEMP_FILE_MAX_AGE_MS),
    removeOldObjects("generated", env.TEMP_FILE_MAX_AGE_MS),
  ]);

  if (uploadsDeleted > 0 || generatedDeleted > 0) {
    logger.info({ uploadsDeleted, generatedDeleted }, "Temp file cleanup sweep completed");
  }

  return NextResponse.json({ success: true, uploadsDeleted, generatedDeleted });
}
