import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";

const MAX_OUTPUT_TOKENS = 2048;

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
  promptFeedback?: { blockReason?: string };
}

/**
 * Thin client around the Gemini `generateContent` REST API. Uses the
 * platform's native `fetch` rather than a Google SDK — avoids adding a new
 * dependency for what's a single JSON POST.
 */
export class GeminiService {
  async generate(question: string, documentText: string | null): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      logger.error("AI Chat request received but GEMINI_API_KEY is not configured");
      throw ApiError.internal("AI chat is not configured on the server. Please contact the administrator.");
    }

    const prompt = documentText
      ? `You are DocuFlow AI, a helpful assistant answering questions about a document the user has uploaded. Use ONLY the document text below to answer — it's grouped by page as "[Page N]". If the answer isn't in the document, say so clearly instead of guessing.\n\n--- DOCUMENT START ---\n${documentText}\n--- DOCUMENT END ---\n\nQuestion: ${question}`
      : `You are DocuFlow AI, a helpful assistant for a PDF tools app. The user hasn't attached a document, so answer their question helpfully and concisely.\n\nQuestion: ${question}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.4 },
        }),
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      throw ApiError.serviceUnavailable(`Couldn't reach the AI service: ${reason}. Please try again.`);
    }

    if (response.status === 429) {
      throw ApiError.tooManyRequests(
        "The AI service is rate-limited right now. Please wait a moment and try again."
      );
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      logger.error({ status: response.status, bodyText }, "Gemini API request failed");
      throw ApiError.serviceUnavailable("The AI service is temporarily unavailable. Please try again.");
    }

    const data = (await response.json()) as GeminiResponse;

    if (data.promptFeedback?.blockReason) {
      throw ApiError.badRequest("The AI couldn't answer that request. Please rephrase your question.");
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

    if (!text) {
      throw ApiError.serviceUnavailable("The AI service returned an empty response. Please try again.");
    }

    return text;
  }
}
