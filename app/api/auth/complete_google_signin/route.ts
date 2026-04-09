import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!authSecret) {
    return NextResponse.json(
      { error: "Missing auth secret" },
      { status: 500 },
    );
  }

  const secureCookie = process.env.NODE_ENV === "production";
  const cookieName = secureCookie
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const token = await getToken({
    req,
    secret: authSecret,
    secureCookie,
    cookieName,
  });

  if (!token?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: token.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not onboarded" }, { status: 403 });
  }
  let verifier;
  if (user.role === "RECRUITER") {
    verifier = await prisma.recruiter.findUnique({
      select: {
        isVerified: true,
      },
      where: {
        userId: user.id,
      },
    });
  } else {
    verifier = await prisma.candidate.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        isVerified: true,
      },
    });
  }

  const jwt = signJwt({
    userId: user.id,
    role: user.role,
    isVerified: verifier?.isVerified,
  });

  const res = NextResponse.json({
    success: true,
    role: user.role.toLowerCase(),
  });

  res.cookies.set("auth_token", jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;
}
