"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ToolErrorState({
  title = "Something went wrong",
  description = "We couldn't process this file. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
        <AlertTriangle className="size-7" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RotateCcw /> Try again
      </Button>
    </motion.div>
  );
}
