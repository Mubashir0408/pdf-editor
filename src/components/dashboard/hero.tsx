"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";
import { useWallpaper } from "@/hooks/use-wallpaper";
import { wallpaperComponents, wallpaperMeta } from "@/components/dashboard/wallpapers";
import { GlobalSearch } from "@/components/layout/global-search";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHero() {
  const { wallpaper, setWallpaper, mounted } = useWallpaper();
  const Wallpaper = wallpaperComponents[wallpaper];
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-b-[2.5rem] lg:rounded-3xl lg:mx-6 lg:mt-6">
      <div className="absolute inset-0">
        {mounted && (
          <AnimatePresence mode="wait">
            <motion.div
              key={wallpaper}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Wallpaper />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      {/* Subtle overlay for text legibility — not heavy */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex min-h-[320px] flex-col justify-end gap-6 px-5 pt-16 pb-10 sm:px-8 sm:pb-12 lg:min-h-[380px] lg:px-10">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <WallpaperPicker current={wallpaper} onChange={setWallpaper} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-white/75">
            {getGreeting()}, {firstName}
          </p>
          <h1 className="mt-1 max-w-xl text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-[42px]">
            What are we working on today?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl"
        >
          <GlobalSearch variant="hero" />
        </motion.div>
      </div>
    </div>
  );
}

function WallpaperPicker({
  current,
  onChange,
}: {
  current: string;
  onChange: (id: (typeof wallpaperMeta)[number]["id"]) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md"
          aria-label="Change wallpaper"
        >
          <ImageIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Dashboard scenery</p>
        <div className="flex flex-col gap-1">
          {wallpaperMeta.map((w) => (
            <button
              key={w.id}
              onClick={() => onChange(w.id)}
              className={cn(
                "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-muted",
                current === w.id && "bg-primary/10 text-primary"
              )}
            >
              {w.label}
              {current === w.id && <Check className="size-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
