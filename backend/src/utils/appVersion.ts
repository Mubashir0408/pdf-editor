import fs from "node:fs";
import path from "node:path";

/**
 * Reads the version from package.json at runtime rather than importing it,
 * so `src/` can stay TypeScript-only and self-contained under `rootDir`.
 * `__dirname` is `dist/utils` in the built output and `src/utils` in dev —
 * both sit exactly two levels below `backend/`, so the relative path holds
 * either way.
 */
export function getAppVersion(): string {
  try {
    const packageJsonPath = path.join(__dirname, "..", "..", "package.json");
    const raw = fs.readFileSync(packageJsonPath, "utf-8");
    const parsed = JSON.parse(raw) as { version?: string };
    return parsed.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
