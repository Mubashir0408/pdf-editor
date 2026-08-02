import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { prisma } from "../database/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

/**
 * TEMPORARY diagnostic endpoint (added to debug the Supabase connection
 * switch) — distinguishes "can't reach the database" from "reached it, but
 * migrations haven't been applied yet", which a plain SELECT 1 can't tell
 * you. Safe to remove once the connection is confirmed stable; in
 * production it never reveals more than `env.isDevelopment` allows.
 */
export const testDatabase = asyncHandler(async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    throw ApiError.serviceUnavailable(
      "Could not connect to the database.",
      env.isDevelopment ? [{ field: "prismaError", message: describeError(err) }] : []
    );
  }

  try {
    const uploadedFileCount = await prisma.uploadedFile.count();
    sendSuccess(res, {
      database: "connected",
      migrationsApplied: true,
      uploadedFileCount,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021") {
      throw ApiError.serviceUnavailable(
        "Connected to the database, but migrations haven't been applied yet. Run `npx prisma migrate dev`.",
        env.isDevelopment ? [{ field: "prismaError", message: describeError(err) }] : []
      );
    }
    throw err;
  }
});

function describeError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return `${err.constructor.name}: ${err.message}`;
  }
  if (err instanceof Error) {
    return `${err.constructor.name}: ${err.message}`;
  }
  return String(err);
}
