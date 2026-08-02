import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  params?: ZodTypeAny;
  query?: ZodTypeAny;
  body?: ZodTypeAny;
}

/**
 * Validates `req.params` / `req.query` / `req.body` against the given Zod
 * schemas and replaces each with its parsed (and therefore typed, coerced,
 * and trimmed) result. Any schema you omit is left untouched.
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        next(
          ApiError.badRequest(
            "Invalid request parameters",
            result.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            }))
          )
        );
        return;
      }
      req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        next(
          ApiError.badRequest(
            "Invalid query parameters",
            result.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            }))
          )
        );
        return;
      }
      req.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        next(
          ApiError.badRequest(
            "Invalid request body",
            result.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            }))
          )
        );
        return;
      }
      req.body = result.data;
    }

    next();
  };
}
