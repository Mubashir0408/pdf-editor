import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import { env } from "./env";

const COOKIE_NAME = "docuflow_guest_id";
/** Must survive closing/reopening the browser, not just a page refresh —
 *  a session cookie wouldn't. */
const COOKIE_MAX_AGE_S = 365 * 24 * 60 * 60;

/**
 * Ensures every request carries a stable anonymous id, persisted as an
 * HttpOnly cookie the frontend can't read or clear on its own. Route
 * Handlers can both read and write cookies via `next/headers`'s `cookies()`
 * — the `Set-Cookie` header is attached to the outgoing response
 * automatically, no need to thread a `NextResponse` through.
 */
export async function getOrCreateGuestId(): Promise<string> {
  const store = await cookies();
  let guestId = store.get(COOKIE_NAME)?.value;

  if (!guestId) {
    guestId = randomUUID();
    store.set(COOKIE_NAME, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProduction,
      maxAge: COOKIE_MAX_AGE_S,
      path: "/",
    });
  }

  return guestId;
}
