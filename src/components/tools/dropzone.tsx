"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
}

export function Dropzone({
  onFilesAdded,
  accept,
  multiple = true,
  title = "Drag & drop files here",
  subtitle = "or click to browse from your device",
  formats = "PDF, DOCX, XLSX, PPTX, JPG, PNG up to 100MB",
  className,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

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
        "relative flex cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
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

      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <motion.div
        animate={{ y: isDragging ? -6 : [0, -8, 0] }}
        transition={
          isDragging
            ? { duration: 0.2 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25"
      >
        <UploadCloud className="size-7 text-white" strokeWidth={1.75} />
      </motion.div>

      <div className="relative">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <p className="relative text-xs text-muted-foreground/70">{formats}</p>
    </motion.div>
  );
}
