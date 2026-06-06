import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { auth } from "./src/lib/auth";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function normalizePathname(pathname: string) {
  const parts = pathname.split("/");
  const possibleLocale = parts[1];

  if (possibleLocale && routing.locales.includes(possibleLocale as "ar" | "en")) {
    const normalized = `/${parts.slice(2).join("/")}`.replace(/\/+/g, "/");
    return normalized === "/" ? normalized : normalized.replace(/\/$/, "") || "/";
  }

  return pathname === "/" ? pathname : pathname.replace(/\/$/, "") || "/";
}

export default auth((req) => {
  const session = req.auth;
  const pathname = normalizePathname(req.nextUrl.pathname);

  if (pathname === "/" || pathname === "/login") {
    return intlMiddleware(req);
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user?.role !== "ADMIN") {
      if (pathname !== "/admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      return intlMiddleware(req);
    }

    return intlMiddleware(req);
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|_vercel|.*\\..*).*)"],
};
