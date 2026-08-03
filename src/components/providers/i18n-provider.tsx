"use client";

import * as React from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/lib/i18n/i18n";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isSupportedLocale, getLocaleInfo } from "@/lib/i18n/locales";

/**
 * Restores the visitor's previously chosen language (localStorage only —
 * no account, no server-side locale negotiation) as soon as this mounts,
 * and keeps `<html lang>`/`<html dir>` in sync so Arabic/Urdu render
 * right-to-left. The root layout always renders `lang="en"` on the server,
 * so a returning visitor with a saved non-English language sees one
 * client-side correction on load — an acceptable trade-off for an app with
 * no server-side locale routing.
 *
 * That correction is applied by changing this wrapper's `key`, not by
 * letting the language change flow through as a normal re-render. A normal
 * re-render asks React to reconcile/patch the already-hydrated (English)
 * DOM into the new language in place, and on a route using Suspense
 * boundaries (every App Router page) that patch can race with parts of the
 * tree finishing their initial hydration, surfacing as a spurious
 * "hydration mismatch, tree regenerated" console error even though the
 * language change itself happens well after mount. Changing `key` instead
 * makes React unmount the stale English subtree and mount a fresh one
 * outright — a real mount has nothing to reconcile against, so there's
 * nothing to mismatch.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [renderKey, setRenderKey] = React.useState(i18n.language);

  React.useEffect(() => {
    const handleLanguageChanged = (lng: string) => setRenderKey(lng);
    i18n.on("languageChanged", handleLanguageChanged);

    const timer = setTimeout(() => {
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
    }, 0);

    return () => {
      clearTimeout(timer);
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <React.Fragment key={renderKey}>{children}</React.Fragment>
    </I18nextProvider>
  );
}
