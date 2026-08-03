"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/layout/global-search";
import { Logo } from "@/components/layout/sidebar-content";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={onMenuClick}
      >
        <Menu className="size-5" />
      </Button>
      <div className="lg:hidden">
        <Logo />
      </div>

      <div className="flex-1 flex justify-center px-2 lg:justify-start lg:px-0">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher className="hidden border-0 bg-transparent shadow-none hover:bg-muted sm:flex" />
      </div>
    </header>
  );
}
