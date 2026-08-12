"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  formats?: string;
  className?: string;
  /** "default" fits inside a card; "hero" is a light glass style for use over
   *  a colored hero background; "compact" is a slim, light-on-color
   *  secondary bar for the same colored-hero context — small icon, no idle
   *  animation, no formats line. */
  tone?: "default" | "hero" | "compact";
}

export function Dropzone({
  onFilesAdded,
  accept,
  multiple = true,
  title,
  subtitle,
  formats,
  className,
  tone = "default",
}: DropzoneProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isHero = tone === "hero";
  const isCompact = tone === "compact";
  const resolvedTitle = title ?? t("common.dropFilesHere");
  const resolvedSubtitle = subtitle ?? t("common.orClickToBrowse");
  const resolvedFormats = formats ?? `PDF, DOCX, XLSX, PPTX, JPG, PNG ${t("common.upTo100mb")}`;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    onFilesAdded(Array.from(fileList));
  };

  return (
    <motion.div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      aria-label={resolvedTitle}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        "relative flex cursor-pointer overflow-hidden transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isCompact
          ? cn(
              "glass-panel flex-row items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-left",
              isDragging ? "border-white bg-white/20" : "border-white/40 hover:border-white/70 hover:bg-white/10"
            )
          : isHero
            ? cn(
                "glass-panel flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center shadow-2xl shadow-black/20",
                isDragging ? "border-white bg-white/20" : "border-white/40 hover:border-white/70 hover:bg-white/10"
              )
            : cn(
                "flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
              ),
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {tone === "default" && <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />}

      <motion.div
        animate={isCompact ? { y: isDragging ? -2 : 0 } : { y: isDragging ? -6 : [0, -8, 0] }}
        transition={
          isDragging || isCompact
            ? { duration: 0.2 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        className={cn(
          "relative flex shrink-0 items-center justify-center shadow-lg",
          isCompact ? "size-9 rounded-lg shadow-sm" : "size-16 rounded-2xl",
          isHero || isCompact
            ? "bg-white/15 shadow-black/10"
            : "bg-gradient-to-br from-primary to-secondary shadow-primary/25"
        )}
      >
        <UploadCloud className={cn(isCompact ? "size-4" : "size-7", "text-white")} strokeWidth={1.75} />
      </motion.div>

      <div className="relative">
        <p
          className={cn(
            isCompact ? "text-sm font-medium" : "text-base font-medium",
            isHero || isCompact ? "text-white" : "text-foreground"
          )}
        >
          {resolvedTitle}
        </p>
        <p
          className={cn(
            isCompact ? "text-xs" : "mt-1 text-sm",
            isHero || isCompact ? "text-white/75" : "text-muted-foreground"
          )}
        >
          {resolvedSubtitle}
        </p>
      </div>

      {!isCompact && (
        <p className={cn("relative text-xs", isHero ? "text-white/60" : "text-muted-foreground/70")}>
          {resolvedFormats}
        </p>
      )}
    </motion.div>
  );
}
