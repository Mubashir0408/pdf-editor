"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Download, Eye, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileIcon } from "@/components/shared/file-icon";
import type { FileType } from "@/lib/types";

interface ResultCardProps {
  fileName: string;
  fileType: FileType;
  sizeLabel?: string;
  summary?: string;
  onReset: () => void;
  onPreview?: () => void;
  /** When provided, the Download button is a real link to the generated
   *  file. Tools not yet backed by the real API omit this and get the
   *  same inert button as before. */
  downloadUrl?: string;
}

export function ResultCard({
  fileName,
  fileType,
  sizeLabel,
  summary,
  onReset,
  onPreview,
  downloadUrl,
}: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
      className="flex flex-col items-center gap-5 rounded-2xl border border-success/20 bg-success/5 px-6 py-10 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
        <CheckCircle2 className="size-7" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">All done!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {summary ?? "Your file is ready to download."}
        </p>
      </div>

      <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left">
        <FileIcon type={fileType} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          {sizeLabel && <p className="text-xs text-muted-foreground">{sizeLabel}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button variant="gradient" asChild={!!downloadUrl}>
          {downloadUrl ? (
            <a href={downloadUrl} download={fileName}>
              <Download /> Download
            </a>
          ) : (
            <>
              <Download /> Download
            </>
          )}
        </Button>
        {onPreview && (
          <Button variant="outline" onClick={onPreview}>
            <Eye /> Preview
          </Button>
        )}
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw /> Start over
        </Button>
      </div>
    </motion.div>
  );
}
