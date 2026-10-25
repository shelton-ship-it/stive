import { NextRequest, NextResponse } from "next/server";

const locales = ["en", "pt", "es", "fr", "de"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (host.includes("stiveconvert.com")) {
    return NextResponse.redirect(
      new URL(`https://stive.tech/convert${pathname}`),
      301
    );
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  const locale =
    request.headers
      .get("accept-language")
      ?.split(",")[0]
      ?.split("-")[0] ?? defaultLocale;

  const selectedLocale = locales.includes(locale) ? locale : defaultLocale;

  return NextResponse.redirect(
    new URL(`/${selectedLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
