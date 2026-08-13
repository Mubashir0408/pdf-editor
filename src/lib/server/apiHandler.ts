import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "./ApiError";
import { logger } from "./logger";
import { env } from "./env";
import type { ApiErrorBody, ApiErrorDetail, ApiSuccessBody } from "./api-types";

function devDetail(rawMessage: string): ApiErrorDetail[] {
  return env.isDevelopment ? [{ field: "debug", message: rawMessage }] : [];
}

/** Normalizes any thrown value into an `ApiError` — mirrors the old
 *  Express `error.middleware.ts`'s `normalizeError`. */
function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  if (err instanceof ZodError) {
    const errors: ApiErrorDetail[] = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return ApiError.badRequest("Validation failed", errors);
  }

  if (err instanceof Error) {
    return ApiError.internal(undefined, devDetail(err.message));
  }

  return ApiError.internal();
}

export function sendSuccess<T>(data: T, message = "Success", status = 200): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ success: true, message, data }, { status });
}

type RouteHandler<Ctx> = (req: Request, ctx: Ctx) => Promise<NextResponse>;

/**
 * Wraps a Route Handler so a thrown `ApiError` (or `ZodError`, or any other
 * error) is rendered into the exact same `{ success: false, message,
 * errors, status, timestamp, requestId }` envelope the old Express
 * `error.middleware.ts` produced — the frontend's `getApiErrorMessage`
 * reads this shape and needs it unchanged.
 */
export function apiHandler<Ctx = unknown>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (req, ctx) => {
    const requestId = randomUUID();
    try {
      return await handler(req, ctx);
    } catch (err) {
      const apiError = normalizeError(err);
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
      return NextResponse.json(body, { status: apiError.status });
    }
  };
}
