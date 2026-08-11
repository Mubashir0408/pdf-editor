"use client";

import * as React from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-destructive/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-64 rounded-full bg-warning/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ rotate: [0, -4, 4, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          className="flex size-24 items-center justify-center rounded-3xl bg-destructive/10"
        >
          <AlertTriangle className="size-11 text-destructive" strokeWidth={1.5} />
        </motion.div>

        <div className="max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            An unexpected error interrupted this page. Your files are safe — try again, or head
            back to your dashboard.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-muted-foreground/60">
              Error ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="gradient" size="lg" onClick={reset}>
            <RotateCcw /> Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              <Home /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
