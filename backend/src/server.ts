import type { Server } from "node:http";

import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { ensureDirSync } from "./utils/pathHelpers";
import { startTempFileCleanup } from "./utils/tempFileCleanup";
import { htmlRendererService } from "./services";

// Multer (uploads) and DownloadService (processed output) will fail on
// every request if these don't exist yet — created once at boot rather
// than lazily on first use.
ensureDirSync(env.uploadDir);
ensureDirSync(env.generatedDir);

const app = createApp();
const cleanupInterval = startTempFileCleanup();

let currentServer: Server | undefined;

/**
 * `tsx watch` restarts this whole module on every file change. On Windows
 * in particular, the previous process's socket isn't always released by
 * the instant the new one tries to bind — there's no POSIX-style graceful
 * SIGTERM handoff, so the OS can still be tearing down the old listener
 * when this one starts. Without a retry, that one-time race would kill
 * the dev server on the very first hot reload (EADDRINUSE surfaces as an
 * unhandled `error` event on the server, which Node treats as an uncaught
 * exception with no listener attached — fatal by default).
 */
function startServer(retriesLeft = 5): void {
  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, uploadDir: env.uploadDir, generatedDir: env.generatedDir },
      `DocuFlow AI backend listening on http://localhost:${env.PORT}`
    );
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && retriesLeft > 0) {
      logger.warn(
        { port: env.PORT, retriesLeft },
        "Port still in use (previous instance may still be shutting down) — retrying..."
      );
      setTimeout(() => startServer(retriesLeft - 1), 300);
      return;
    }

    logger.error({ err }, "Failed to start server");
    process.exit(1);
  });

  currentServer = server;
}

startServer();

function shutdown(signal: string) {
  logger.info({ signal }, "Shutting down gracefully...");

  clearInterval(cleanupInterval);
  void htmlRendererService.closeBrowser();

  if (!currentServer) {
    process.exit(0);
    return;
  }

  currentServer.close(() => {
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
