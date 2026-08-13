import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { extractPagesBodySchema } from "@/lib/server/validators/extractPages.validator";
import { extractPagesService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(extractPagesBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "extract-pages");

  const result = await extractPagesService.extract(body);
  await recordUsage(subject, "extract-pages");

  return sendSuccess(result, "Pages extracted successfully", 201);
});
