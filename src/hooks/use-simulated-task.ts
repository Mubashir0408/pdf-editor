"use client";

import * as React from "react";

export type TaskStatus = "idle" | "processing" | "done" | "error";

interface SimulatedTaskOptions {
  /** 0-1 chance the task lands on "error" instead of "done". Defaults to 0 (never fails). */
  failureRate?: number;
}

export function useSimulatedTask(durationMs = 2200, options: SimulatedTaskOptions = {}) {
  const { failureRate = 0 } = options;
  const [status, setStatus] = React.useState<TaskStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const start = React.useCallback(() => {
    clear();
    setStatus("processing");
    setProgress(0);
    const willFail = failureRate > 0 && Math.random() < failureRate;
    const stepMs = 90;
    const steps = durationMs / stepMs;
    let current = 0;
    timerRef.current = setInterval(() => {
      current += 1;
      const pct = Math.min(100, Math.round((current / steps) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clear();
        setStatus(willFail ? "error" : "done");
      }
    }, stepMs);
  }, [clear, durationMs, failureRate]);

  const reset = React.useCallback(() => {
    clear();
    setStatus("idle");
    setProgress(0);
  }, [clear]);

  React.useEffect(() => clear, [clear]);

  return { status, progress, start, retry: start, reset };
}
