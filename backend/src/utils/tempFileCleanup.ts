import fs from "node:fs/promises";
import path from "node:path";

import { env } from "../config/env";
import { logger } from "../config/logger";

async function sweepDirectory(dir: string, maxAgeMs: number): Promise<number> {
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return 0;
  }

  const now = Date.now();
  let deletedCount = 0;

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.startsWith(".")) return; // .gitkeep and the like
      const filePath = path.join(dir, entry);
      try {
        const stat = await fs.stat(filePath);
        if (!stat.isFile()) return;
        if (now - stat.mtimeMs > maxAgeMs) {
          await fs.unlink(filePath);
          deletedCount++;
        }
      } catch {
        // Already gone (deleted concurrently by the request that used it) — fine, ignore.
      }
    })
  );

  return deletedCount;
}

/**
 * Every uploaded/generated file is meant to be short-lived — deleted right
 * after its tool finishes with it, or downloaded shortly after it's
 * created. This periodic sweep is the safety net for the ones that
 * aren't: an upload whose conversion failed before cleanup ran, or a
 * generated file nobody ever came back to download. There's no other
 * natural trigger for "this file has been sitting here too long," so it
 * runs on its own interval rather than from any request handler.
 */
export function startTempFileCleanup(): NodeJS.Timeout {
  const sweep = async () => {
    const [uploadsDeleted, generatedDeleted] = await Promise.all([
      sweepDirectory(env.uploadDir, env.TEMP_FILE_MAX_AGE_MS),
      sweepDirectory(env.generatedDir, env.TEMP_FILE_MAX_AGE_MS),
    ]);
    if (uploadsDeleted > 0 || generatedDeleted > 0) {
      logger.info({ uploadsDeleted, generatedDeleted }, "Temp file cleanup sweep completed");
    }
  };

  void sweep();
  return setInterval(sweep, Math.min(env.TEMP_FILE_MAX_AGE_MS, 15 * 60 * 1000));
}
