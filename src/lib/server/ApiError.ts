import type { ApiErrorDetail } from "./api-types";

/**
 * Every intentional error in the app is thrown as an `ApiError` (or a
 * subclass). `apiHandler` knows how to render these into the standard
 * error envelope; anything else it catches is treated as an unexpected 500.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly errors: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(status: number, message: string, errors: ApiErrorDetail[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors: ApiErrorDetail[] = []) {
    return new ApiError(400, message, errors);
  }

  static notFound(message: string) {
    return new ApiError(404, message);
  }

  static payloadTooLarge(message: string) {
    return new ApiError(413, message);
  }

  static unsupportedMediaType(message: string) {
    return new ApiError(415, message);
  }

  static tooManyRequests(message: string) {
    return new ApiError(429, message);
  }

  static internal(message = "Something went wrong. Please try again.", errors: ApiErrorDetail[] = []) {
    return new ApiError(500, message, errors);
  }

  static serviceUnavailable(message: string, errors: ApiErrorDetail[] = []) {
    return new ApiError(503, message, errors);
  }
}
