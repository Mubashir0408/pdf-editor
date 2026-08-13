import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow } from "@/lib/server/validate";
import { ApiError } from "@/lib/server/ApiError";
import { translateJobParamSchema } from "@/lib/server/validators/translate.validator";
import { translationJobsService } from "@/lib/server/services";

export const GET = apiHandler(async (_req, { params }: { params: Promise<{ jobId: string }> }) => {
  const { jobId } = parseOrThrow(translateJobParamSchema, await params, "path parameters");

  const status = await translationJobsService.get(jobId);
  if (!status) {
    throw ApiError.notFound("This translation job was not found. It may have expired — please try again.");
  }

  return sendSuccess(status, "Translation job status");
});
