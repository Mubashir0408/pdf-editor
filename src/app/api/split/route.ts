import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { splitBodySchema } from "@/lib/server/validators/split.validator";
import { splitService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(splitBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "split");

  const result = await splitService.split(body);
  await recordUsage(subject, "split");

  return sendSuccess(result, "PDF split successfully", 201);
});
