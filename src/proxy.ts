import { NextResponse, type NextRequest } from "next/server";

import { logRequestEvent } from "@/lib/request-logger";

export function proxy(request: NextRequest) {
  logRequestEvent(request);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff|woff2)$).*)",
  ],
};
