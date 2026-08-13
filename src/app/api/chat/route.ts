import { apiHandler, sendSuccess } from "@/lib/server/apiHandler";
import { parseOrThrow, readJsonBody } from "@/lib/server/validate";
import { chatBodySchema } from "@/lib/server/validators/chat.validator";
import { chatService } from "@/lib/server/services";

/** Comfortably covers the OpenRouter service's internal 30s timeout plus
 *  PDF extraction overhead, within Hobby's 60s ceiling. */
export const maxDuration = 60;

export const POST = apiHandler(async (req) => {
  const body = parseOrThrow(chatBodySchema, await readJsonBody(req), "request body");

  const reply = await chatService.ask(body);

  return sendSuccess({ reply }, "Reply generated");
});
