"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function ToolHero({
  icon: Icon,
  title,
  description,
  gradientFrom = "#5B7FFF",
  gradientTo = "#7C5CFF",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 px-6 py-10 sm:px-10 sm:py-12">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-[0.15]" />
      <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-black/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 flex flex-col items-start gap-4"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="glass-panel flex size-14 items-center justify-center rounded-2xl text-white shadow-lg"
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-1.5 max-w-lg text-sm text-white/80 sm:text-base">{description}</p>
        </div>
      </motion.div>
    </div>
  );
}
