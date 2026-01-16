import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let authUser: any;

  try {
    authUser = verifyJwt(token);
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { id } = body;

    if (authUser.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.candidate.findUnique({
      where: { userId: authUser.userId },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    if (!id) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }

    const existing = await prisma.resume.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const active = await prisma.resume.updateMany({
      where: {
        candidateId: user.id,
      },
      data: {
        isActive: false,
      },
    });

    const resume = await prisma.resume.update({
      where: {
        id,
      },
      data: {
        isActive: true,
      },
    });

    return NextResponse.json(
      { message: "Resume set successfully", id: resume.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding resume:", error);
    return NextResponse.json(
      { error: "Failed to add resume" },
      { status: 500 }
    );
  }
}
