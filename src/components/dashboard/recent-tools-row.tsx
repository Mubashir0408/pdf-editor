"use client";

import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { quickActions } from "@/lib/mock-data";
import { useRecentTools } from "@/hooks/use-recent-tools";

/** Recently used tools, read from this browser's localStorage only — nothing account-based. */
export function RecentToolsRow() {
  const { recentToolIds, mounted } = useRecentTools();

  if (!mounted || recentToolIds.length === 0) return null;

  const tools = recentToolIds
    .map((id) => quickActions.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  if (tools.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Recently used on this device</h2>
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {tools.map((tool) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[tool.icon] ?? Icons.FileText;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Icon className="size-4 text-primary" />
              {tool.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
