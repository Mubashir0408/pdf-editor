import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { pdfToImageBodySchema } from "@/lib/server/validators/pdfToImage.validator";
import { pdfToImageService } from "@/lib/server/services";

export const maxDuration = 60;

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(pdfToImageBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "pdf-to-image");

  const result = await pdfToImageService.convert(body);
  await recordUsage(subject, "pdf-to-image");

  return sendSuccess(result, "PDF converted successfully", 201);
});
