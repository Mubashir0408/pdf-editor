import type { ZodTypeAny, z } from "zod";

import { ApiError } from "./ApiError";

/** Parses `data` against `schema`, throwing the same `ApiError.badRequest`
 *  shape the old Express `validate.middleware.ts` produced on failure. */
export function parseOrThrow<S extends ZodTypeAny>(schema: S, data: unknown, label: string): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw ApiError.badRequest(
      `Invalid ${label}`,
      result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }))
    );
  }
  return result.data as z.infer<S>;
}

/** Parses a Route Handler's JSON body, translating a malformed/missing body
 *  into the same validation-error shape rather than an unhandled parse
 *  exception. */
export async function readJsonBody(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw ApiError.badRequest("Request body must be valid JSON.");
  }
}
