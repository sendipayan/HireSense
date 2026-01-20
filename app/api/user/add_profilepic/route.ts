import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload?.userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { fileUrl } = body;

    if (!fileUrl)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { profilePic: fileUrl },
    });

    return NextResponse.json(
      {
        message: "Profile picture added successfully",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error adding profile picture:", error);
    return NextResponse.json(
      { error: "Failed to add profile picture" },
      { status: 500 },
    );
  }
}
