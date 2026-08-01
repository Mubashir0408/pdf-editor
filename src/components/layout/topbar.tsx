"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationsPopover } from "@/components/layout/notifications-popover";
import { UserMenu } from "@/components/layout/user-menu";
import { Logo } from "@/components/layout/sidebar-content";

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
        <Button asChild size="sm" variant="gradient" className="hidden sm:inline-flex">
          <Link href="/upload">
            <Upload /> Upload
          </Link>
        </Button>
        <Button asChild size="icon" variant="gradient" className="sm:hidden">
          <Link href="/upload" aria-label="Upload">
            <Upload className="size-4" />
          </Link>
        </Button>
        <ThemeToggle />
        <NotificationsPopover />
        <UserMenu />
      </div>
    </header>
  );
}
