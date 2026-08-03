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
  /** "default" fits inside a card; "hero" is a light glass style for use over the homepage hero. */
  tone?: "default" | "hero";
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
      aria-label="Upload files"
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl text-center transition-colors",
        isHero
          ? cn(
              "glass-panel border-2 border-dashed px-6 py-10 shadow-2xl shadow-black/20",
              isDragging ? "border-white bg-white/20" : "border-white/40 hover:border-white/70 hover:bg-white/10"
            )
          : cn(
              "border-2 border-dashed px-6 py-14",
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

      {!isHero && <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />}

      <motion.div
        animate={{ y: isDragging ? -6 : [0, -8, 0] }}
        transition={
          isDragging
            ? { duration: 0.2 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        className={cn(
          "relative flex size-16 items-center justify-center rounded-2xl shadow-lg",
          isHero ? "bg-white/15 shadow-black/10" : "bg-gradient-to-br from-primary to-secondary shadow-primary/25"
        )}
      >
        <UploadCloud className={cn("size-7", isHero ? "text-white" : "text-white")} strokeWidth={1.75} />
      </motion.div>

      <div className="relative">
        <p className={cn("text-base font-medium", isHero ? "text-white" : "text-foreground")}>{resolvedTitle}</p>
        <p className={cn("mt-1 text-sm", isHero ? "text-white/75" : "text-muted-foreground")}>{resolvedSubtitle}</p>
      </div>

      <p className={cn("relative text-xs", isHero ? "text-white/60" : "text-muted-foreground/70")}>{resolvedFormats}</p>
    </motion.div>
  );
}
