"use client";

import * as React from "react";
import type { WallpaperId } from "@/components/dashboard/wallpapers";

const STORAGE_KEY = "docuflow-wallpaper";
const DEFAULT_WALLPAPER: WallpaperId = "mountains";

export function useWallpaper() {
  const [wallpaper, setWallpaperState] = React.useState<WallpaperId>(DEFAULT_WALLPAPER);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as WallpaperId | null;
    if (stored) setWallpaperState(stored);
    setMounted(true);
  }, []);

  const setWallpaper = React.useCallback((id: WallpaperId) => {
    setWallpaperState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return { wallpaper, setWallpaper, mounted };
}
