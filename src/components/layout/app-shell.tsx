"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh w-full bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className="flex min-h-svh flex-1 flex-col min-w-0">
        <Topbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 pb-20 lg:pb-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
