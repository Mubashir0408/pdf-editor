import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";
import type { ApiErrorBody, ApiErrorDetail } from "../types/api";

/** Only attached in development — the raw error text (a stack line, a
 *  filesystem path, ...) can reveal internals a real client response
 *  should never carry in production. */
function devDetail(rawMessage: string): ApiErrorDetail[] {
  return env.isDevelopment ? [{ field: "debug", message: rawMessage }] : [];
}

/**
 * Normalizes any thrown value into an `ApiError` so the rest of this
 * middleware only has one shape to render. Errors we recognize (bad input,
 * an oversized upload, a missing file) get a specific status and a message
 * that's already safe to show a user; anything unrecognized is treated as
 * an internal bug — logged in full always, and in development *also*
 * returned to the client verbatim (via `devDetail`) so a real bug is
 * immediately visible instead of hiding behind a generic 500. Production
 * never gets more than the generic message.
 */
function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof ZodError) {
    const errors: ApiErrorDetail[] = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return ApiError.badRequest("Validation failed", errors);
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return ApiError.payloadTooLarge("File exceeds the maximum allowed size.");
    }
    return ApiError.badRequest(`File upload error: ${err.message}`);
  }

  if (err instanceof Error) {
    return ApiError.internal(undefined, devDetail(err.message));
  }

  return ApiError.internal();
}

// Express only recognizes this as error-handling middleware if it declares
// all four parameters — `_next` must stay even though it's unused.
export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const apiError = normalizeError(err);
  const requestId = req.id?.toString() ?? "unknown";

  const logPayload = { requestId, status: apiError.status, err };
  if (apiError.status >= 500) {
    logger.error(logPayload, apiError.message);
  } else {
    logger.warn(logPayload, apiError.message);
  }

  const body: ApiErrorBody = {
    success: false,
    message: apiError.message,
    errors: apiError.errors,
    status: apiError.status,
    timestamp: new Date().toISOString(),
    requestId,
  };

  res.status(apiError.status).json(body);
}
