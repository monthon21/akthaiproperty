import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const locales = ["th", "en", "zh"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Protect /myprofile pages
  const isMyProfile = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/myprofile`)
  );

  if (isMyProfile) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });
    if (!token) {
      const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || "th";
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
  }

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Get locale from cookie or default to "th"
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  const locale = cookieLocale && locales.includes(cookieLocale) ? cookieLocale : "th";

  // Redirect to localized URL
  const targetUrl = new URL(`/${locale}${pathname}${nextUrl.search}`, req.url);
  return NextResponse.redirect(targetUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.png|.*\\.webp|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.gif|.*\\.ico).*)",
  ],
};
