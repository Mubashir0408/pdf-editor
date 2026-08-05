import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import { DEFAULT_LOCALE } from "./locales";

/**
 * Only the default locale's dictionary is bundled eagerly — it's the one
 * every visitor needs immediately (matching the server's always-English
 * render). The other 11 are a genuinely unused ~73KB of JSON for the ~11
 * in every 12 visitors who never switch language, so they're loaded on
 * demand instead (see `ensureLocaleLoaded` below), the same way any other
 * route-level code-splitting works in this app.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en } },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

const LOCALE_LOADERS: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  de: () => import("./translations/de.json"),
  fr: () => import("./translations/fr.json"),
  es: () => import("./translations/es.json"),
  it: () => import("./translations/it.json"),
  pt: () => import("./translations/pt.json"),
  tr: () => import("./translations/tr.json"),
  ar: () => import("./translations/ar.json"),
  hi: () => import("./translations/hi.json"),
  ur: () => import("./translations/ur.json"),
  zh: () => import("./translations/zh.json"),
  ja: () => import("./translations/ja.json"),
};

const loadedLocales = new Set<string>(["en"]);

/** Fetches and registers a locale's dictionary the first time it's needed;
 *  a no-op on every call after that. Must resolve before `i18n.changeLanguage`
 *  is called for that locale, or `t()` would render fallback/English text
 *  for a moment until the chunk arrives. */
export async function ensureLocaleLoaded(code: string): Promise<void> {
  if (loadedLocales.has(code)) return;

  const load = LOCALE_LOADERS[code];
  if (!load) return;

  const mod = await load();
  i18n.addResourceBundle(code, "translation", mod.default, true, true);
  loadedLocales.add(code);
}

export default i18n;
