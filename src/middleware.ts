import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sellerMayAccess, verifySession } from "@/lib/session";

// Melindungi seluruh halaman CMS (/admin/*) kecuali login, dan membatasi penjual ke portalnya.
// Catatan: setiap halaman & aksi server tetap memeriksa hak akses sendiri (lib/auth.ts).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const url = req.nextUrl.clone();
  url.search = "";
  if (!session) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (session.role === "penjual" && !sellerMayAccess(pathname)) {
    url.pathname = "/admin/toko";
    return NextResponse.redirect(url);
  }
  if (session.role === "admin" && pathname.startsWith("/admin/toko")) {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
