import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { wordToPdfBodySchema } from "@/lib/server/validators/wordToPdf.validator";
import { wordToPdfService } from "@/lib/server/services";

/** Puppeteer render — give it the full Hobby-plan budget. */
export const maxDuration = 60;

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(wordToPdfBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "word-to-pdf");

  const result = await wordToPdfService.convert(body);
  await recordUsage(subject, "word-to-pdf");

  return sendSuccess(result, "Document converted successfully", 201);
});
