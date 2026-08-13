import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { deletePagesBodySchema } from "@/lib/server/validators/deletePages.validator";
import { deletePagesService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(deletePagesBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "delete-pages");

  const result = await deletePagesService.delete(body);
  await recordUsage(subject, "delete-pages");

  return sendSuccess(result, "Pages deleted successfully", 201);
});
