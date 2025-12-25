import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: NextRequest) {
  // ✅ Read NextAuth session token directly
  try {
    const { role } = await req.json();
    const session: Session | null = await getServerSession(authOptions);
    if (session) {
      let user = await prisma.user.findUnique({
        where: { email: session?.user.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: session?.user.email,
            name: session?.user.name!,
            role,
            password: "GOOGLE_OAUTH",
          },
        });
        if (role === "RECRUITER") {
          await prisma.recruiter.create({
            data: {
              userId: user.id,
            },
          });
        } else {
          await prisma.candidate.create({
            data: {
              userId: user.id,
            },
          });
        }
      }

      const token = signJwt({
        userId: user.id,
        role: user.role,
      });

      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return NextResponse.json(
        { message: "Login successful" },
        { status: 200 }
      );
    }
  } catch (err: any) {
    console.log("Error in google login: ", err);
    return NextResponse.json({ message: "login failed" }, { status: 500 });
  }
}
