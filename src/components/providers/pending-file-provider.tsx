"use client";

import * as React from "react";

interface PendingFileContextValue {
  file: File | null;
  setFile: (file: File | null) => void;
  /** Reads and clears the pending file in one step — use on a tool page's mount. */
  consume: () => File | null;
}

const PendingFileContext = React.createContext<PendingFileContextValue | null>(null);

export function PendingFileProvider({ children }: { children: React.ReactNode }) {
  const [file, setFile] = React.useState<File | null>(null);
  const fileRef = React.useRef<File | null>(null);
  fileRef.current = file;

  const consume = React.useCallback(() => {
    const current = fileRef.current;
    if (current) setFile(null);
    return current;
  }, []);

  const value = React.useMemo(() => ({ file, setFile, consume }), [file, consume]);

  return <PendingFileContext.Provider value={value}>{children}</PendingFileContext.Provider>;
}

/**
 * Hands a file from the homepage dropzone off to whichever tool page loads next.
 * Not persisted (File objects can't survive storage) — purely an in-memory relay
 * for the "drop on homepage → land on a tool with it pre-loaded" flow.
 */
export function usePendingFile() {
  const ctx = React.useContext(PendingFileContext);
  if (!ctx) throw new Error("usePendingFile must be used within a PendingFileProvider");
  return ctx;
}
