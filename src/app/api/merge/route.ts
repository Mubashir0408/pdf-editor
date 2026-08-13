import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { mergeBodySchema } from "@/lib/server/validators/merge.validator";
import { mergeService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(mergeBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "merge");

  const result = await mergeService.merge(body.fileIds);
  await recordUsage(subject, "merge");

  return sendSuccess(result, "PDFs merged successfully", 201);
});
