"use client";

import * as React from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n/i18n";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isSupportedLocale, getLocaleInfo } from "@/lib/i18n/locales";

/**
 * Restores the visitor's previously chosen language (localStorage only —
 * no account, no server-side locale negotiation) as soon as this mounts,
 * and keeps `<html lang>`/`<html dir>` in sync so Arabic/Urdu render
 * right-to-left. The root layout always renders `lang="en"` on the server
 * (see its `suppressHydrationWarning`), so a returning visitor with a
 * non-English saved language sees one client-side correction on load
 * rather than a locale-aware server render — an acceptable trade-off for
 * an app with no server-side locale routing.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      // localStorage unavailable — fall back to the default locale
    }

    const initial = stored && isSupportedLocale(stored) ? stored : DEFAULT_LOCALE;
    if (initial !== i18n.language) {
      void i18n.changeLanguage(initial);
    }

    const info = getLocaleInfo(initial);
    document.documentElement.lang = initial;
    document.documentElement.dir = info.dir;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
