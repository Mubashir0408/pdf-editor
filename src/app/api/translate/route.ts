import { after } from "next/server";

import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { translateBodySchema } from "@/lib/server/validators/translate.validator";
import { pdfTranslateService, translationJobsService } from "@/lib/server/services";
import { logger } from "@/lib/server/logger";

/** Puppeteer render + OCR + batched translation calls — give it the full
 *  Hobby-plan budget. A job with several scanned (OCR-needed) pages can
 *  still exceed this; see the migration report for that residual risk. */
export const maxDuration = 60;

/**
 * Translation is slow enough to need real progress reporting instead of a
 * single blocking request. The old Express backend achieved this with a
 * fire-and-forget `void this.run(...)` after returning — that pattern
 * doesn't exist in a serverless function (execution stops once the
 * response is sent). Next.js's `after()` is the serverless equivalent:
 * the response returns immediately with `jobId`, and `run()` keeps
 * executing (within this same invocation's `maxDuration` budget) writing
 * progress to the `translation_jobs` table as it goes — `GET
 * /api/translate/[jobId]` (a separate, possibly different, invocation)
 * reads that table, so polling sees real incremental progress exactly like
 * before.
 */
export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(translateBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "translate");

  const jobId = await pdfTranslateService.createJob();

  after(async () => {
    // `run()` never rejects — it catches every failure itself and writes it
    // to the job row (see `pdfTranslate.service.ts`) — so success can only
    // be read back from the job's final status, not from `run()` throwing.
    await pdfTranslateService.run(jobId, body);
    const finalState = await translationJobsService.get(jobId);
    if (finalState?.status === "done") {
      await recordUsage(subject, "translate").catch((err) => {
        logger.warn({ err, jobId }, "Failed to record usage for a completed translation job");
      });
    }
  });

  return sendSuccess({ jobId }, "Translation started", 202);
});
