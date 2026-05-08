"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function LanguageSwitcher() {
  const router = useRouter();
  const { dictionary, locale } = useI18n();

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("locale");

    if (storedLocale && storedLocale !== locale && locales.includes(storedLocale as Locale)) {
      persistLocale(storedLocale as Locale);
      router.refresh();
    }
  }, [locale, router]);

  function handleChange(nextLocale: Locale) {
    persistLocale(nextLocale);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2" aria-label={dictionary.shell.language}>
      {locales.map((item) => (
        <Button
          key={item}
          type="button"
          size="sm"
          variant={locale === item ? "default" : "outline"}
          onClick={() => handleChange(item)}
        >
          {localeLabels[item]}
        </Button>
      ))}
    </div>
  );
}

function persistLocale(locale: Locale) {
  window.localStorage.setItem("locale", locale);
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${localeCookieMaxAge}; SameSite=Lax`;
}
