import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/ApiError";

/**
 * Mounted after every route. Any request that reaches this point matched no
 * route, so it's turned into a standard 404 `ApiError` and handed to the
 * global error handler for a consistent response shape.
 */
export function notFoundMiddleware(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
