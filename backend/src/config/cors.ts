import type { CorsOptions } from "cors";

import { env } from "./env";

/**
 * TODO(deploy): set the real production frontend origin(s) here once the
 * frontend is deployed.
 */
const PRODUCTION_ORIGINS: string[] = [];

/**
 * Next.js falls back to the next free port whenever its preferred one is
 * taken (3000 -> 3001 -> 3002 -> ...), so a fixed short allowlist drifts
 * out of date the moment two dev servers are running at once — and when it
 * does, the failure is a CORS-blocked request that the browser reports to
 * axios as a plain network error, which looks identical to "the backend
 * isn't running" from the frontend's side. There's no session/cookie data
 * to protect yet (no auth), so trading that specific risk for "any
 * localhost port works in dev" is the right call until auth exists.
 */
const LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;

export const corsOptions: CorsOptions = {
  origin: env.isDevelopment
    ? (origin, callback) => {
        if (!origin || LOCALHOST_ORIGIN.test(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin "${origin}" is not allowed by CORS.`));
      }
    : PRODUCTION_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
