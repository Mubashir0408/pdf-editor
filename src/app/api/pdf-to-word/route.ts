import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { pdfToWordBodySchema } from "@/lib/server/validators/pdfToWord.validator";
import { pdfToWordService } from "@/lib/server/services";

export const maxDuration = 60;

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(pdfToWordBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "pdf-to-word");

  const result = await pdfToWordService.convert(body);
  await recordUsage(subject, "pdf-to-word");

  return sendSuccess(result, "PDF converted successfully", 201);
});
