import { env } from "../env";
import { logger } from "../logger";
import { ApiError } from "../ApiError";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;

const DOCUMENT_SYSTEM_PROMPT =
  "You are Docy's PDF assistant. Answer questions using the provided PDF content. Do not invent information. " +
  "If the answer cannot be found in the provided document, clearly say that the information is not available in the document.";

const GENERAL_SYSTEM_PROMPT = "You are Docy's AI assistant. Answer the user's question helpfully and accurately.";

interface OpenRouterChoice {
  message?: { content?: string | null };
}

interface OpenRouterResponseBody {
  choices?: OpenRouterChoice[];
}

interface OpenRouterErrorBody {
  error?: { message?: string; code?: number | string };
}

/**
 * Ported unchanged from the old Express backend's `openrouter.service.ts`
 * — pure `fetch`, no Node/Express dependency, so it moves over as-is.
 */
export class OpenRouterService {
  async answer(question: string, documentContent: string | null): Promise<string> {
    if (!env.OPENROUTER_API_KEY) {
      throw ApiError.serviceUnavailable("AI service is not configured.");
    }

    const systemPrompt = documentContent === null ? GENERAL_SYSTEM_PROMPT : DOCUMENT_SYSTEM_PROMPT;
    const userContent =
      documentContent === null ? question : `DOCUMENT CONTENT:\n${documentContent}\n\nUSER QUESTION:\n${question}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
        signal: controller.signal,
      });
    } catch (err) {
      const reason = err instanceof Error ? err.name : String(err);
      logger.error({ reason }, "OpenRouter request failed (network/timeout)");
      throw ApiError.serviceUnavailable("The AI service is temporarily unavailable. Please try again later.");
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let errorMessage: string | undefined;
      try {
        const body = (await response.json()) as OpenRouterErrorBody;
        errorMessage = body.error?.message;
      } catch {
        // Body wasn't JSON — nothing more to extract.
      }
      logger.error({ status: response.status, errorMessage }, "OpenRouter returned an error response");

      if (response.status === 401 || response.status === 403) {
        throw ApiError.serviceUnavailable("The AI service could not authenticate the request.");
      }
      if (response.status === 429) {
        throw ApiError.tooManyRequests("The free AI service limit has been reached. Please try again later.");
      }
      throw ApiError.serviceUnavailable("The AI service is temporarily unavailable. Please try again later.");
    }

    let data: OpenRouterResponseBody;
    try {
      data = (await response.json()) as OpenRouterResponseBody;
    } catch {
      throw ApiError.serviceUnavailable("The AI service is temporarily unavailable. Please try again later.");
    }

    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      logger.error("OpenRouter response contained no message content");
      throw ApiError.serviceUnavailable("The AI service is temporarily unavailable. Please try again later.");
    }

    return reply;
  }
}
