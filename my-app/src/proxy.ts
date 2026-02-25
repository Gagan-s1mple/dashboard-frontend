import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const fastapi_path = "http://34.233.120.188:8000";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/next-proxy/")) {
    const path = pathname.replace("/next-proxy", "");
    const url = `${fastapi_path}${path}${search}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/next-proxy/:path*"],
};