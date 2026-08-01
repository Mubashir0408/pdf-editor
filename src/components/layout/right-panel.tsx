"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

/**
 * Docked right panel for the desktop layout (Left Sidebar / Top Navigation /
 * Main Content / Right Panel). Hidden below `xl` — pair with
 * `RightPanelSheet` to expose the same content as a drawer on smaller
 * viewports, matching the collapsible aside pattern used across the app.
 */
export function RightPanel({
  title,
  children,
  onClose,
  className,
  breakpoint = "xl",
}: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  breakpoint?: "lg" | "xl";
}) {
  return (
    <aside
      className={cn(
        "hidden w-80 shrink-0 flex-col border-l border-border bg-background",
        breakpoint === "xl" ? "xl:flex" : "lg:flex",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label={`Close ${title}`}>
            <X className="size-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
    </aside>
  );
}

/** Mobile/tablet counterpart of `RightPanel` — same content, drawer presentation. */
export function RightPanelSheet({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0">
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <div className="flex items-center justify-between border-b border-border p-4">
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
