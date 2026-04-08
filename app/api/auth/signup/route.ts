"use server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/jwt";
import { cookies } from "next/headers";
import { verifyOtp } from "@/app/actions/verify-otp";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, name, password, role, otp } = body;

    if (!email || !name || !password || !role || !otp) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    let user = await prisma.user.findUnique({
      where: { email },
    });
    const verified = await verifyOtp(email, otp);

    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    if (user) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    } else {
      user = await prisma.user.create({
        data: {
          email,
          role,
          name,
          password: hashedPassword,
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

    
    // Create JWT
    const token = signJwt({
      userId: user.id,
      role: user.role,
      isVerified: role==="RECRUITER" ? "PENDING" : false,
    });

    const cookieStore = await cookies();

    // Store in httpOnly cookie
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
