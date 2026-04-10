import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { verifyOtp } from "@/app/actions/verify-otp";

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    // Check basic stuff to simulate real conditions
    if (!email || !otp || !password) {
      return NextResponse.json(
        { message: "Missing required fields for password reset" },
        { status: 400 },
      );
    }

    const verified = await verifyOtp(email, otp);

    if (!verified) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Dummy logic success
    return NextResponse.json(
      { message: "Password successfully updated!" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
