import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow } from "@/lib/server/validate";
import { idParamSchema } from "@/lib/server/validators/common.validator";
import { resolveUploadedFilePath } from "@/lib/server/resolveUploadedFile";
import { pdfService } from "@/lib/server/services";

export const GET = apiHandler(async (_req, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = parseOrThrow(idParamSchema, await params, "path parameters");

  const filePath = await resolveUploadedFilePath(id);
  const pageCount = await pdfService.getPageCount(filePath);

  return sendSuccess({ pageCount });
});
