import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { imageToPdfBodySchema } from "@/lib/server/validators/imageToPdf.validator";
import { imageToPdfService } from "@/lib/server/services";

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(imageToPdfBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "image-to-pdf");

  const result = await imageToPdfService.convert(body);
  await recordUsage(subject, "image-to-pdf");

  return sendSuccess(result, "Images converted successfully", 201);
});
