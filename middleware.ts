import { NextRequest, NextResponse } from "next/server";
import { verifyJwtEdge } from "@/lib/jwt_edge";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    console.log("token present");
  }
  // Not logged in
  else {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = await verifyJwtEdge(token);
  console.log(payload);

  // Invalid / expired token
  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /**
   * ROLE-BASED ACCESS
   *
   * /recruiter/*  → RECRUITER only
   * /candidate/*  → CANDIDATE only
   */

  if (pathname.startsWith("/recruiter") && payload.role !== "RECRUITER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/candidate") && payload.role !== "CANDIDATE") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  //if (pathname.startsWith("/login") && token) {
  // return NextResponse.redirect(new URL("/", req.url));
  //}
  return NextResponse.next();
}

export const config = {
  matcher: ["/recruiter/:path*", "/candidate/:path*"],
};
