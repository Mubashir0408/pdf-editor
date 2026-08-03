"use client";

import * as React from "react";

import i18n from "@/lib/i18n/i18n";
import { locales, LOCALE_STORAGE_KEY, getLocaleInfo } from "@/lib/i18n/locales";

function applyDocumentLocale(code: string) {
  const info = getLocaleInfo(code);
  document.documentElement.lang = code;
  document.documentElement.dir = info.dir;
}

/** Switches the active UI language, persists it, and keeps `<html lang/dir>` in sync. */
export function useLocale() {
  const [locale, setLocaleState] = React.useState(i18n.language || "en");

  React.useEffect(() => {
    const handler = (lng: string) => setLocaleState(lng);
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  const setLocale = React.useCallback((code: string) => {
    void i18n.changeLanguage(code);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      // localStorage unavailable (private browsing, etc.) — safe to no-op
    }
    applyDocumentLocale(code);
  }, []);

  return { locale, setLocale, locales };
}
