import type { PrismaClient } from "@prisma/client";

import { getAppVersion } from "../utils/appVersion";

export type DatabaseStatus = "connected" | "disconnected";

export interface HealthReport {
  status: "ok" | "degraded";
  database: DatabaseStatus;
  version: string;
  timestamp: string;
}

export class HealthService {
  constructor(private readonly prisma: PrismaClient) {}

  async check(): Promise<HealthReport> {
    const database = await this.checkDatabase();

    return {
      status: database === "connected" ? "ok" : "degraded",
      database,
      version: getAppVersion(),
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase(): Promise<DatabaseStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return "connected";
    } catch {
      return "disconnected";
    }
  }
}
