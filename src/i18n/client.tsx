"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

import { defaultLocale, localizePath, type Locale } from "@/i18n/config";
import { dictionaries, type Dictionary } from "@/i18n/dictionaries";

const I18nContext = createContext<{
  locale: Locale;
  dictionary: Dictionary;
}>({
  locale: defaultLocale,
  dictionary: dictionaries[defaultLocale],
});

export function I18nProvider({
  children,
  dictionary,
  locale,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <I18nContext.Provider value={{ dictionary, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLocalizedPath() {
  const pathname = usePathname();
  const { locale } = useI18n();

  return (href: string) => {
    if (/^(https?:|mailto:|tel:|#)/.test(href)) {
      return href;
    }

    return localizePath(href.startsWith("/") ? href : `/${href}`, locale);
  };
}
