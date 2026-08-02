import pino from "pino";

import { env } from "./env";

/**
 * Fields that must never reach the log output, even if a caller accidentally
 * passes them through in a log object (e.g. `logger.info({ req }, "...")`).
 */
const REDACT_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.jwtSecret",
];

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
  transport: env.isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
// hot reload check 1785690382
// hot reload retest 1785690532
// stress test 1 1785690558
// stress test 2 1785690560
// stress test 3 1785690563
