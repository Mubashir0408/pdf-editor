import type { Response } from "express";

import type { ApiSuccessBody } from "../types/api";

/**
 * The single place that shapes a successful response body, so every
 * controller returns the exact same envelope: `{ success, message, data }`.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = { success: true, message, data };
  return res.status(statusCode).json(body);
}
