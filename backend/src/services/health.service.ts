import { getAppVersion } from "../utils/appVersion";

export interface HealthReport {
  status: "ok";
  version: string;
  timestamp: string;
}

/**
 * There's no database to check anymore — this app is stateless, so "the
 * process is up and able to respond" is the entire definition of healthy.
 */
export class HealthService {
  check(): HealthReport {
    return {
      status: "ok",
      version: getAppVersion(),
      timestamp: new Date().toISOString(),
    };
  }
}
