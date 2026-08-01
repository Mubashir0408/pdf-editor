"use client";

import { motion } from "framer-motion";
import { GripVertical, X } from "lucide-react";

import { cn, formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { FileType } from "@/lib/types";
import { FileIcon } from "@/components/shared/file-icon";

export function inferFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const valid: FileType[] = ["pdf", "docx", "xlsx", "pptx", "jpg", "png", "txt", "zip"];
  return (valid as string[]).includes(ext) ? (ext as FileType) : "pdf";
}

interface SelectedFileRowProps {
  name: string;
  size: number;
  onRemove?: () => void;
  draggable?: boolean;
  progress?: number;
  index?: number;
  className?: string;
}

export function SelectedFileRow({
  name,
  size,
  onRemove,
  draggable = false,
  progress,
  index,
  className,
}: SelectedFileRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5",
        className
      )}
    >
      {draggable && (
        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing" />
      )}
      {typeof index === "number" && (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
      )}
      <FileIcon type={inferFileType(name)} className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        {typeof progress === "number" ? (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progress} className="h-1.5" />
            <span className="w-9 shrink-0 text-right text-[11px] text-muted-foreground">
              {progress}%
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{formatBytes(size)}</p>
        )}
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      )}
    </motion.div>
  );
}
