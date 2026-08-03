import { randomUUID } from "node:crypto";

import type { ProcessedFileDto } from "../types/file";

export type TranslateStage = "extracting" | "translating" | "rendering" | "done" | "error";

export interface TranslateJobState {
  status: "processing" | "done" | "error";
  stage: TranslateStage;
  progress: number;
  current?: number;
  total?: number;
  result?: ProcessedFileDto;
  error?: string;
}

const JOB_TTL_MS = 10 * 60 * 1000;

/**
 * Translation is the one tool slow and multi-step enough (network calls per
 * paragraph batch) to warrant real progress reporting instead of a single
 * blocking request — so unlike every other tool, this one is job-based: the
 * route starts the job and returns immediately with an id, the frontend
 * polls for status. State lives in process memory only (no database, per
 * this project's stateless design) and expires on its own after
 * `JOB_TTL_MS` so an abandoned job doesn't linger forever; `sweep()` runs
 * opportunistically on every create/get rather than on a timer.
 */
export class TranslationJobsService {
  private jobs = new Map<string, { state: TranslateJobState; expiresAt: number }>();

  create(): string {
    this.sweep();
    const id = randomUUID();
    this.jobs.set(id, {
      state: { status: "processing", stage: "extracting", progress: 0 },
      expiresAt: Date.now() + JOB_TTL_MS,
    });
    return id;
  }

  update(id: string, patch: Partial<TranslateJobState>): void {
    const entry = this.jobs.get(id);
    if (!entry) return;
    entry.state = { ...entry.state, ...patch };
    entry.expiresAt = Date.now() + JOB_TTL_MS;
  }

  get(id: string): TranslateJobState | undefined {
    this.sweep();
    return this.jobs.get(id)?.state;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, entry] of this.jobs) {
      if (entry.expiresAt < now) this.jobs.delete(id);
    }
  }
}
