"use client";

import { Globe } from "lucide-react";

import { useLocale } from "@/hooks/use-locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, locales } = useLocale();

  return (
    <Select value={locale} onValueChange={setLocale}>
      <SelectTrigger className={cn("w-auto gap-1.5", className)} aria-label="Language">
        <Globe className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
