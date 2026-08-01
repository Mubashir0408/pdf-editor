"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { mobileNavItems } from "@/lib/nav-config";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg lg:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {mobileNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute top-1 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon
                className={cn(
                  "size-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                strokeWidth={2}
              />
              <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
