import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { protectBodySchema } from "@/lib/server/validators/protect.validator";
import { protectService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(protectBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "protect");

  const result = await protectService.protect(body);
  await recordUsage(subject, "protect");

  return sendSuccess(result, "PDF protected successfully", 201);
});
