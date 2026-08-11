"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { FileText, ChevronsLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { navGroups } from "@/lib/nav-config";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
      <div className="relative flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm shadow-primary/30">
        <FileText className="size-4 text-white" strokeWidth={2.5} />
      </div>
      {!collapsed && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Doc<span className="text-primary">y</span>
        </span>
      )}
    </Link>
  );
}

export function SidebarNav({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto scrollbar-thin px-2.5 py-1">
      {navGroups.map((group, groupIndex) => (
        <div key={group.labelKey || groupIndex} className="flex flex-col gap-1">
          {!collapsed && group.labelKey && (
            <span className="px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              {t(group.labelKey)}
            </span>
          )}
          {group.items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const label = t(item.labelKey);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  collapsed && "justify-center px-0 py-2.5",
                  active
                    ? "text-primary"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon className="relative z-10 size-[18px] shrink-0" strokeWidth={2} />
                {!collapsed && (
                  <span className="relative z-10 flex-1 truncate">{label}</span>
                )}
                {!collapsed && item.badge && (
                  <Badge variant="accent" className="relative z-10 h-5 px-1.5 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </div>
      ))}
    </nav>
  );
}

export function CollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="hidden lg:flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <ChevronsLeft
        className={cn("size-4 transition-transform duration-300", collapsed && "rotate-180")}
      />
    </button>
  );
}
