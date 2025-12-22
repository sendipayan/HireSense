import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      if (user.role !== role) {
        return NextResponse.json({ message: "Invalid role" }, { status: 401 });
      }
      const verified = await verifyPassword(password, user.password);
      if (!verified) {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
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
    console.log("Error in login: ", err);
    return NextResponse.json({ message: "login failed" }, { status: 500 });
  }
}
