import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { powerpointToPdfBodySchema } from "@/lib/server/validators/powerpointToPdf.validator";
import { powerpointToPdfService } from "@/lib/server/services";

export const maxDuration = 60;

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(powerpointToPdfBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "powerpoint-to-pdf");

  const result = await powerpointToPdfService.convert(body);
  await recordUsage(subject, "powerpoint-to-pdf");

  return sendSuccess(result, "Presentation converted successfully", 201);
});
