import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { enforceUsage, recordUsage } from "@/lib/server/usage";
import { excelToPdfBodySchema } from "@/lib/server/validators/excelToPdf.validator";
import { excelToPdfService } from "@/lib/server/services";

export const maxDuration = 60;

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(excelToPdfBodySchema, await readJsonBody(req), "request body");
  const subject = await enforceUsage(req, "excel-to-pdf");

  const result = await excelToPdfService.convert(body);
  await recordUsage(subject, "excel-to-pdf");

  return sendSuccess(result, "Spreadsheet converted successfully", 201);
});
