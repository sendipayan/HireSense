import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
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

  const verifier = await prisma.recruiter.findUnique({
    select: {
      isVerified: true,
    },
    where: {
      userId: user.id,
    },
  });

  const jwt = signJwt({
    userId: user.id,
    role: user.role,
    isVerified: verifier?.isVerified ?? "PENDING",
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
