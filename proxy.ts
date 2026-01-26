import { NextRequest, NextResponse } from "next/server";
import { verifyJwtEdge } from "@/lib/jwt_edge";
import { cookies } from "next/headers";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (token) {
    console.log("token present");

    // Not logged in

    // Redirect logged-in users away from login
    const payload = await verifyJwtEdge(token);
    if (pathname.startsWith("/login")) {
      if (payload) {
        return NextResponse.redirect(
          new URL(`/${payload.role.toLowerCase()}/dashboard`, req.url),
        );
      }
    }

    // Invalid / expired token
    if (!payload) {
      return NextResponse.redirect(new URL("/", req.url));
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
    if (
      pathname.startsWith("/recruiter/post-job") &&
      payload.isVerified !== "APPROVED"
    ) {
      return NextResponse.redirect(
        new URL("/recruiter/dashboard/profile", req.url),
      );
    }

    if (pathname.startsWith("/candidate") && payload.role !== "CANDIDATE") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    console.log("token not present");
    if (pathname.startsWith("/recruiter")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname.startsWith("/candidate")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/recruiter/:path*", "/candidate/:path*", "/login/:path*"],
};
