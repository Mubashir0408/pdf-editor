import Link from "next/link";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { quickActions } from "@/lib/mock-data";

/** Curated suggestions per tool — falls back to the next tools in the list if not specified. */
const relatedMap: Record<string, string[]> = {
  convert: ["merge", "compress", "ocr"],
  merge: ["split", "compress", "convert"],
  split: ["merge", "extract", "delete-pages"],
  compress: ["convert", "merge", "watermark"],
  ocr: ["translate", "convert", "ai-chat"],
  translate: ["ocr", "ai-chat", "convert"],
  "ai-chat": ["ocr", "translate", "convert"],
  protect: ["watermark", "compress", "rotate"],
  watermark: ["protect", "rotate", "compress"],
  rotate: ["extract", "delete-pages", "merge"],
  extract: ["delete-pages", "split", "merge"],
  "delete-pages": ["extract", "split", "merge"],
};

export function RelatedTools({ currentId }: { currentId: string }) {
  const relatedIds =
    relatedMap[currentId] ?? quickActions.filter((a) => a.id !== currentId).slice(0, 3).map((a) => a.id);

  const tools = relatedIds
    .map((id) => quickActions.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a);

  if (tools.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">Related tools</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tools.map((tool) => {
          const Icon = (Icons as unknown as Record<string, LucideIcon>)[tool.icon] ?? Icons.FileText;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 card-elevated transition-shadow hover:card-elevated-lg"
            >
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundImage: `linear-gradient(135deg, ${tool.colorFrom}, ${tool.colorTo})` }}
              >
                <Icon className="size-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{tool.label}</p>
                <p className="truncate text-xs text-muted-foreground">{tool.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
