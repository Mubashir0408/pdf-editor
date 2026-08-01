"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Layers, Scissors, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
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

export function GlobalSearch({ variant = "topbar" }: { variant?: "topbar" | "hero" }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

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
      {variant === "topbar" ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="h-9 w-full max-w-sm justify-start gap-2 rounded-lg text-muted-foreground font-normal sm:pr-2.5"
        >
          <Search className="size-4" />
          <span className="hidden sm:inline">Search everything...</span>
          <span className="sm:hidden">Search</span>
          <CommandShortcut className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] sm:inline-block">
            ⌘K
          </CommandShortcut>
        </Button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "glass-panel flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left shadow-2xl shadow-black/20 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          )}
        >
          <Search className="size-5 shrink-0 text-white/80" />
          <span className="flex-1 text-[15px] text-white/80">
            Search tools, or ask AI a question...
          </span>
          <span className="hidden rounded-md border border-white/20 bg-white/10 px-2 py-1 text-xs text-white/70 sm:inline-block">
            ⌘K
          </span>
        </button>
      )}
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
                <item.icon /> {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
