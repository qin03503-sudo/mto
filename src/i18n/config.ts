export const locales = ["en", "fa"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  fa: "فارسی",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function getDirection(locale: Locale) {
  return locale === "fa" ? "rtl" : "ltr";
}

export function localizePath(pathname: string, locale: Locale) {
  void locale;
  return pathname;
}
