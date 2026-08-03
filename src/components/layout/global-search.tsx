"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Search, RefreshCw, Layers, Scissors, Sparkles } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { allNavItems } from "@/lib/nav-config";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
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

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-full max-w-sm justify-start gap-2 rounded-lg text-muted-foreground font-normal sm:pr-2.5"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">{t("common.search")}</span>
        <span className="sm:hidden">{t("common.search")}</span>
        <CommandShortcut className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline-block">
          ⌘K
        </CommandShortcut>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Search DocuFlow AI">
        <CommandInput placeholder="Search tools and actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => go("/convert")}>
              <RefreshCw /> Convert a file
            </CommandItem>
            <CommandItem onSelect={() => go("/merge")}>
              <Layers /> Merge PDFs
            </CommandItem>
            <CommandItem onSelect={() => go("/split")}>
              <Scissors /> Split a PDF
            </CommandItem>
            <CommandItem onSelect={() => go("/chat")}>
              <Sparkles /> Ask AI about a document
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navigate">
            {allNavItems.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon /> {t(item.labelKey)}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
