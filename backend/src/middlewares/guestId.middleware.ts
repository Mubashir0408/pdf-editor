import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { env } from "../config/env";

const COOKIE_NAME = "docuflow_guest_id";
/** Must survive closing/reopening the browser, not just a page refresh —
 *  a session cookie wouldn't. */
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;

  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = part.slice(0, separatorIndex).trim();
    if (key === name) return decodeURIComponent(part.slice(separatorIndex + 1).trim());
  }

  return undefined;
}

/**
 * Ensures every request carries a stable anonymous id, persisted as an
 * HttpOnly cookie rather than anything the frontend can read or clear on
 * its own — the whole point of guest usage tracking is that it can't be
 * reset by a page refresh or frontend state, only by clearing cookies.
 * Attaches the id to `req.guestId` for `usage.middleware.ts`.
 */
export function guestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  let guestId = readCookie(req, COOKIE_NAME);

  if (!guestId) {
    guestId = crypto.randomUUID();
    res.cookie(COOKIE_NAME, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProduction,
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  req.guestId = guestId;
  next();
}
