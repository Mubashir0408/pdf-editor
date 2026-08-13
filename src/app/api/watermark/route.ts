import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { watermarkBodySchema } from "@/lib/server/validators/watermark.validator";
import { watermarkService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(watermarkBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "watermark");

  const result = await watermarkService.watermark(body);
  await recordUsage(subject, "watermark");

  return sendSuccess(result, "Watermark added successfully", 201);
});
