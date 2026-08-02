import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async controller so a rejected promise (a thrown `ApiError`, a
 * failed Prisma call, ...) is forwarded to `next()` instead of crashing the
 * process. Without this, every controller would need its own try/catch.
 */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
