"use client";

import * as React from "react";

import { startTranslateJob, getTranslateJobStatus } from "@/lib/api/translate";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { TranslateJobStatus } from "@/lib/api/types";

export type TranslateJobHookStatus = "idle" | "starting" | "processing" | "done" | "error";

const POLL_INTERVAL_MS = 900;

/** Starts a Translate PDF job and polls it to completion — translation is
 *  slow/multi-step enough (OCR, batched network calls) that the backend
 *  runs it as a background job instead of one blocking request; this hook
 *  owns the polling loop so the page component only sees plain state. */
export function useTranslateJob() {
  const [status, setStatus] = React.useState<TranslateJobHookStatus>("idle");
  const [job, setJob] = React.useState<TranslateJobStatus | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = React.useRef(false);

  const stopPolling = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      stopPolling();
    };
  }, [stopPolling]);

  const poll = React.useCallback(
    (jobId: string) => {
      const tick = async () => {
        try {
          const state = await getTranslateJobStatus(jobId);
          if (cancelledRef.current) return;
          setJob(state);

          if (state.status === "done") {
            setStatus("done");
            return;
          }
          if (state.status === "error") {
            setStatus("error");
            setErrorMessage(state.error ?? null);
            return;
          }
          timeoutRef.current = setTimeout(tick, POLL_INTERVAL_MS);
        } catch (err) {
          if (cancelledRef.current) return;
          setStatus("error");
          setErrorMessage(getApiErrorMessage(err));
        }
      };
      void tick();
    },
    []
  );

  const start = React.useCallback(
    async (fileId: string, sourceLang: string, targetLang: string) => {
      stopPolling();
      setStatus("starting");
      setErrorMessage(null);
      setJob(null);
      try {
        const { jobId } = await startTranslateJob(fileId, sourceLang, targetLang);
        if (cancelledRef.current) return;
        setStatus("processing");
        poll(jobId);
      } catch (err) {
        if (cancelledRef.current) return;
        setStatus("error");
        setErrorMessage(getApiErrorMessage(err));
      }
    },
    [poll, stopPolling]
  );

  const reset = React.useCallback(() => {
    stopPolling();
    setStatus("idle");
    setJob(null);
    setErrorMessage(null);
  }, [stopPolling]);

  return { status, job, errorMessage, start, reset };
}
