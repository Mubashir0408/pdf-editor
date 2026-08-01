"use client";

import { FileText } from "lucide-react";

import type { ChatSource } from "@/lib/types";

export function SourcesPanel({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sources referenced in the assistant&apos;s answers will appear here.
        </p>
      ) : (
        sources.map((source) => (
          <div key={source.id} className="rounded-xl border border-border bg-card p-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-primary">
              <FileText className="size-3.5" />
              <span className="truncate">{source.fileName}</span>
              <span className="ml-auto shrink-0 text-muted-foreground">p.{source.page}</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              &ldquo;{source.snippet}&rdquo;
            </p>
          </div>
        ))
      )}
    </div>
  );
}
