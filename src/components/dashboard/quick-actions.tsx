"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { QuickAction } from "@/lib/types";

export function QuickActionsGrid({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {actions.map((action, i) => {
        const Icon = (Icons as unknown as Record<string, LucideIcon>)[action.icon] ?? Icons.FileText;
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={action.href}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 card-elevated outline-none transition-shadow hover:card-elevated-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5"
            >
              <div
                className="flex size-10 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${action.colorFrom}, ${action.colorTo})`,
                }}
              >
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                  {action.description}
                </p>
              </div>
              <div
                className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-20"
                style={{ backgroundColor: action.colorFrom }}
              />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
