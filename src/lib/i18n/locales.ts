export interface LocaleInfo {
  code: string;
  englishName: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

/** The 12 languages this app ships real (not machine-placeholder) UI translations for. */
export const locales: LocaleInfo[] = [
  { code: "en", englishName: "English", nativeName: "English", dir: "ltr" },
  { code: "de", englishName: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "fr", englishName: "French", nativeName: "Français", dir: "ltr" },
  { code: "es", englishName: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "it", englishName: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "pt", englishName: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "ur", englishName: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "zh", englishName: "Chinese", nativeName: "中文", dir: "ltr" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", dir: "ltr" },
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "docuflow-locale";

export function isSupportedLocale(code: string): boolean {
  return locales.some((l) => l.code === code);
}

export function getLocaleInfo(code: string): LocaleInfo {
  return locales.find((l) => l.code === code) ?? locales[0]!;
}
