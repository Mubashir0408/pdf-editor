import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { rotateBodySchema } from "@/lib/server/validators/rotate.validator";
import { rotateService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(rotateBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "rotate");

  const result = await rotateService.rotate(body);
  await recordUsage(subject, "rotate");

  return sendSuccess(result, "PDF rotated successfully", 201);
});
