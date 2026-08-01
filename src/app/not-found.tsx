"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-64 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex size-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-secondary/15"
        >
          <FileQuestion className="size-11 text-primary" strokeWidth={1.5} />
          <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-lg shadow-primary/25">
            404
          </span>
        </motion.div>

        <div className="max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            This page wandered off
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            We couldn&apos;t find the page you&apos;re looking for. It may have been moved, renamed,
            or never existed.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gradient" size="lg">
            <Link href="/dashboard">
              <Home /> Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/convert">
              <ArrowLeft /> Try a tool instead
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
