"use client";

import { useTranslation } from "react-i18next";
import { RefreshCw, Layers, Scissors, Sparkles } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { allNavItems } from "@/lib/nav-config";

/**
 * Split out of `GlobalSearch` and loaded via `next/dynamic` there — cmdk
 * (and this dialog's contents) are dead weight in the initial bundle for
 * every visitor who never opens search, which is most of them on a first
 * visit. The trigger button that's always visible lives in the parent.
 */
export function GlobalSearchDialog({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (href: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search DocuFlow AI">
      <CommandInput placeholder="Search tools and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => onNavigate("/convert")}>
            <RefreshCw /> Convert a file
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/merge")}>
            <Layers /> Merge PDFs
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/split")}>
            <Scissors /> Split a PDF
          </CommandItem>
          <CommandItem onSelect={() => onNavigate("/chat")}>
            <Sparkles /> Ask AI about a document
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {allNavItems.map((item) => (
            <CommandItem key={item.href} onSelect={() => onNavigate(item.href)}>
              <item.icon /> {t(item.labelKey)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
