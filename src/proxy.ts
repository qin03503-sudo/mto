import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";

const PUBLIC_FILE = /\.[\w-]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", resolveLocale(request));

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function resolveLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptedLanguages = request.headers.get("accept-language") ?? "";
  const preferredLocale = acceptedLanguages
    .split(",")
    .map((value) => value.trim().split(";")[0]?.split("-")[0])
    .find((value) => locales.includes(value as Locale));

  return isLocale(preferredLocale) ? preferredLocale : defaultLocale;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
