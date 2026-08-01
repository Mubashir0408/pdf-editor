"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  size?: "sm" | "default";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  size = "default",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 text-center",
        size === "default" ? "py-16" : "py-10",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
        className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className="size-7 text-primary" strokeWidth={1.75} />
        </motion.div>
      </motion.div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button
          className="mt-5"
          variant="gradient"
          size="sm"
          onClick={onAction}
          asChild={!!actionHref}
        >
          {actionHref ? <a href={actionHref}>{actionLabel}</a> : <span>{actionLabel}</span>}
        </Button>
      )}
    </div>
  );
}
