"use client";

import * as React from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Logo, SidebarNav } from "@/components/layout/sidebar-content";

export function MobileDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0" onClick={() => onOpenChange(false)}>
        <SheetHeader className="border-b border-sidebar-border">
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
        </SheetHeader>
        <SidebarNav />
      </SheetContent>
    </Sheet>
  );
}
