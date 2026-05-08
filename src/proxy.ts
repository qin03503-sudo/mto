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

  const pathLocale = getPathLocale(pathname);
  const locale = pathLocale ?? resolveLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);

  const legacyMasterDataRedirect = getLegacyMasterDataRedirect(pathLocale ? stripLocalePrefix(pathname, pathLocale) : pathname);

  if (legacyMasterDataRedirect) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathLocale && pathLocale !== defaultLocale ? `/${pathLocale}${legacyMasterDataRedirect}` : legacyMasterDataRedirect;
    redirectUrl.search = "";

    return withLocaleCookie(NextResponse.redirect(redirectUrl), locale);
  }

  if (pathLocale) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = stripLocalePrefix(pathname, pathLocale);

    return withLocaleCookie(
      NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      }),
      locale
    );
  }

  return withLocaleCookie(NextResponse.next({
    request: { headers: requestHeaders },
  }), locale);
}

function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];

  return isLocale(segment) ? segment : null;
}

function stripLocalePrefix(pathname: string, locale: Locale) {
  const stripped = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), "");

  return stripped || "/";
}

function getLegacyMasterDataRedirect(pathname: string) {
  if (pathname === "/materials" || pathname.startsWith("/materials/")) return "/master-data";
  if (pathname === "/scopes" || pathname.startsWith("/scopes/")) return "/master-data";
  if (pathname === "/parts" || pathname.startsWith("/parts/")) return "/master-data";
  if (pathname === "/mto-rows" || pathname.startsWith("/mto-rows/")) return "/master-data";

  return null;
}

function withLocaleCookie(response: NextResponse, locale: Locale) {
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
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
