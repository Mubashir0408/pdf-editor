"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommandShortcut } from "@/components/ui/command";

// cmdk + the dialog's full content are only needed once a visitor actually
// opens search — deferring them out of the initial bundle costs nothing
// visible (the dialog starts closed) and isn't worth server-rendering.
const GlobalSearchDialog = dynamic(
  () => import("./global-search-dialog").then((mod) => mod.GlobalSearchDialog),
  { ssr: false }
);

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  // Stays true forever once the dialog has been opened once, so it remains
  // mounted (and its close transition plays normally) on every subsequent
  // open/close — only the very first open skips straight to "visible"
  // instead of animating in, which is what deferring its JS until it's
  // actually needed costs here.
  const [hasOpenedOnce, setHasOpenedOnce] = React.useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (open) setHasOpenedOnce(true);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-full min-w-0 max-w-sm justify-start gap-2 rounded-lg text-muted-foreground font-normal sm:pr-2.5"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">{t("common.search")}</span>
        <span className="sm:hidden">{t("common.search")}</span>
        <CommandShortcut className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline-block">
          ⌘K
        </CommandShortcut>
      </Button>
      {hasOpenedOnce && <GlobalSearchDialog open={open} onOpenChange={setOpen} onNavigate={go} />}
    </>
  );
}
