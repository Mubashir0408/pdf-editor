import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translations/en.json";
import de from "./translations/de.json";
import fr from "./translations/fr.json";
import es from "./translations/es.json";
import it from "./translations/it.json";
import pt from "./translations/pt.json";
import tr from "./translations/tr.json";
import ar from "./translations/ar.json";
import hi from "./translations/hi.json";
import ur from "./translations/ur.json";
import zh from "./translations/zh.json";
import ja from "./translations/ja.json";
import { DEFAULT_LOCALE } from "./locales";

const resources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  it: { translation: it },
  pt: { translation: pt },
  tr: { translation: tr },
  ar: { translation: ar },
  hi: { translation: hi },
  ur: { translation: ur },
  zh: { translation: zh },
  ja: { translation: ja },
};

/**
 * All 12 locales' dictionaries are bundled statically (no async fetch) —
 * they're modest in size and this keeps language switching instant, with
 * no loading state needed. Guarded against re-init since this module is
 * evaluated on both the server-render pass of the `I18nProvider` client
 * component and again in the browser.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
