import { PrismaClient } from "@prisma/client";

import { env } from "../config/env";

/**
 * `tsx watch` re-executes this module on every file change during
 * development. Without caching the client on `globalThis`, each reload
 * would open a fresh pool of PostgreSQL connections and eventually exhaust
 * the database's connection limit.
 */
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ["warn", "error"] : ["error"],
  });

if (env.isDevelopment) {
  globalThis.__prisma = prisma;
}
