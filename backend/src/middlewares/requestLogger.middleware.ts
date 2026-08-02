import { randomUUID } from "node:crypto";
import pinoHttp from "pino-http";

import { logger } from "../config/logger";

/**
 * Logs one line per request/response and assigns each request a UUID
 * (`req.id`), which the global error handler echoes back to the client as
 * `requestId` so a bug report can be matched to the exact server log line.
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const id = typeof existing === "string" ? existing : randomUUID();
    res.setHeader("X-Request-Id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // Body/query aren't logged — file uploads and any future request bodies
  // may contain data we don't want duplicated into logs.
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
  },
});
