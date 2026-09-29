import { NextResponse, type NextRequest } from "next/server";

const GUEST_COOKIE = "mtd_guest";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest) {
  if (request.cookies.has(GUEST_COOKIE)) {
    return NextResponse.next();
  }

  const guestId = crypto.randomUUID();
  request.cookies.set(GUEST_COOKIE, guestId);

  const response = NextResponse.next({ request });

  response.cookies.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
