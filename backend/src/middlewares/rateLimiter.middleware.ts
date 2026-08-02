import rateLimit from "express-rate-limit";

import { ApiError } from "../utils/ApiError";

/**
 * Applied globally. Deliberately generous for Milestone 1 (no real usage
 * pattern to tune against yet) — the point right now is having the
 * middleware wired correctly, not the exact numbers.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests("Too many requests. Please try again later."));
  },
});

/** Tighter limit for the upload endpoint specifically — it's the most
 *  expensive route (disk I/O), so it deserves stricter throttling. */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests("Too many upload requests. Please try again later."));
  },
});
