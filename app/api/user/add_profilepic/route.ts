import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

async function handler(
  req: NextRequest,
  user: { userId: string; role: string },
) {
  const body = await req.json();
  const { fileUrl } = body;

  if (!fileUrl)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: { profilePic: fileUrl },
  });

  return NextResponse.json(
    {
      message: "Profile picture added successfully",
      user: updatedUser,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler);
