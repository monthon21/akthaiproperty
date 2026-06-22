import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const locales = ["th", "en", "zh"];

export default auth(async function middleware(req) {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return;
  }

  // Get locale from cookie, headers, or default
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  const locale = (cookieLocale && locales.includes(cookieLocale)) ? cookieLocale : "th";

  // Redirect to localized URL
  const targetUrl = new URL(`/${locale}${pathname}${nextUrl.search}`, req.url);
  return NextResponse.redirect(targetUrl);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.webp|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico).*)"],
};
