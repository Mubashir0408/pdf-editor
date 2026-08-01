"use client";

import * as React from "react";

const STORAGE_KEY = "docuflow-recent-tools";
const MAX_ITEMS = 6;

/**
 * Tracks recently visited tool pages in the browser's localStorage only —
 * no account or server involved, so it's naturally empty for a new visitor
 * and specific to this device.
 */
export function useRecentTools() {
  const [ids, setIds] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
    setMounted(true);
  }, []);

  return { recentToolIds: ids, mounted };
}

/** Call from a tool page on mount to record it as recently used. */
export function recordToolUsage(toolId: string) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    const next = [toolId, ...ids.filter((id) => id !== toolId)].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, etc.) — safe to no-op
  }
}

/** Convenience hook: records `toolId` as recently used as soon as a tool page mounts. */
export function useRecordToolUsage(toolId: string) {
  React.useEffect(() => {
    recordToolUsage(toolId);
  }, [toolId]);
}
