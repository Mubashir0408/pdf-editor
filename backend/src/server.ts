import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { ensureDirSync } from "./utils/pathHelpers";

// Multer (uploads) and DownloadService (processed output) will fail on
// every request if these don't exist yet — created once at boot rather
// than lazily on first use.
ensureDirSync(env.uploadDir);
ensureDirSync(env.generatedDir);

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV, uploadDir: env.uploadDir, generatedDir: env.generatedDir },
    `DocuFlow AI backend listening on http://localhost:${env.PORT}`
  );
});

function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down gracefully...");

  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — shutting down");
  process.exit(1);
});
