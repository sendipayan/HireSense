import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.password === "GOOGLE_OAUTH") {
      return NextResponse.json(
        { message: "User found but not verified" },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "User found", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
