"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Check } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useWallpaper } from "@/hooks/use-wallpaper";
import { usePendingFile } from "@/components/providers/pending-file-provider";
import { wallpaperComponents, wallpaperMeta } from "@/components/dashboard/wallpapers";
import { Dropzone } from "@/components/tools/dropzone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export function DashboardHero() {
  const { wallpaper, setWallpaper, mounted } = useWallpaper();
  const Wallpaper = wallpaperComponents[wallpaper];
  const { setFile } = usePendingFile();
  const router = useRouter();

  const handleFilesAdded = (files: File[]) => {
    setFile(files[0]);
    toast.success(`"${files[0].name}" ready — choose your output format`);
    router.push("/convert");
  };

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

      <div className="relative z-10 flex flex-col items-center gap-8 px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-24">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <WallpaperPicker current={wallpaper} onChange={setWallpaper} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white text-balance sm:text-4xl lg:text-5xl">
            All your PDF tools in one place.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">
            Convert, merge, split, compress, edit, translate and chat with your PDFs in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-lg"
        >
          <Dropzone
            tone="hero"
            onFilesAdded={handleFilesAdded}
            title="Drop a file to get started"
            subtitle="or click to browse — no account needed"
            formats="PDF, DOCX, XLSX, PPTX, JPG, PNG up to 100MB"
          />
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
