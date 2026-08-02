"use client";

import { motion } from "framer-motion";
import { FileText, RotateCcw, RotateCw, Trash2, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ThumbSelectionTone = "primary" | "destructive";

interface PageThumbGridProps {
  totalPages: number;
  selected: Set<number>;
  onToggle: (page: number) => void;
  disabled?: boolean;
  tone?: ThumbSelectionTone;
  /** Per-page rotation in degrees, used by the Rotate tool. */
  rotations?: Record<number, number>;
  onRotate?: (page: number, direction: "left" | "right") => void;
  /** "cozy" (default) leaves room for the rotate-button row; "compact" fits more per row for selection-only grids. */
  density?: "cozy" | "compact";
}

export function PageThumbGrid({
  totalPages,
  selected,
  onToggle,
  disabled,
  tone = "primary",
  rotations,
  onRotate,
  density = "cozy",
}: PageThumbGridProps) {
  const toneClasses =
    tone === "destructive"
      ? "border-destructive bg-destructive/10 text-destructive"
      : "border-primary bg-primary/10 text-primary";

  return (
    <div
      className={cn(
        "grid gap-2.5",
        density === "compact" ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-8" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
      )}
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
        const isSelected = selected.has(page);
        const rotation = rotations?.[page] ?? 0;

        return (
          <div key={page} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggle(page)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`Page ${page}${isSelected ? ", selected" : ""}`}
              className={cn(
                "relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isSelected
                  ? toneClasses
                  : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
              )}
            >
              {isSelected && (
                <span
                  className={cn(
                    "absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full text-white",
                    tone === "destructive" ? "bg-destructive" : "bg-primary"
                  )}
                >
                  {tone === "destructive" ? (
                    <Trash2 className="size-2.5" />
                  ) : (
                    <Check className="size-2.5" />
                  )}
                </span>
              )}
              <motion.div animate={{ rotate: rotation }} transition={{ duration: 0.3 }}>
                <FileText className="size-5" />
              </motion.div>
              {page}
            </button>

            {onRotate && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => onRotate(page, "left")}
                  aria-label={`Rotate page ${page} left`}
                  className="size-6"
                >
                  <RotateCcw className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => onRotate(page, "right")}
                  aria-label={`Rotate page ${page} right`}
                  className="size-6"
                >
                  <RotateCw className="size-3" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
