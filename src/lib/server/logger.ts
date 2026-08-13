import pino from "pino";

import { env } from "./env";

const REDACT_PATHS = ["req.headers.authorization", "req.headers.cookie", "*.password", "*.token", "*.secret"];

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
});
