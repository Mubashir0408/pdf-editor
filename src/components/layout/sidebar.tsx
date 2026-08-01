"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  Logo,
  SidebarNav,
  SidebarStorage,
  CollapseToggle,
} from "@/components/layout/sidebar-content";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Logo collapsed={collapsed} />
      </div>
      <SidebarNav collapsed={collapsed} />
      <SidebarStorage collapsed={collapsed} />
      <div className="flex items-center justify-center border-t border-sidebar-border py-2">
        <CollapseToggle collapsed={collapsed} onToggle={onToggle} />
      </div>
    </motion.aside>
  );
}
