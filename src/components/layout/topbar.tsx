"use client";

import * as React from "react";
import { Menu, Github, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GlobalSearch } from "@/components/layout/global-search";
import { Logo } from "@/components/layout/sidebar-content";

const displayLanguages = ["English", "Spanish", "French", "German", "Portuguese"];

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [language, setLanguage] = React.useState("English");

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
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger
            size="sm"
            className="hidden w-auto gap-1.5 border-0 bg-transparent shadow-none hover:bg-muted sm:flex"
            aria-label="Language"
          >
            <Globe className="size-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {displayLanguages.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
          >
            <Github className="size-[18px]" />
          </a>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
}
