import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const headersList = await headers();
  const locale = headersList.get("x-locale") ?? undefined;

  return isLocale(locale) ? locale : defaultLocale;
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}
