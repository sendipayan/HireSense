import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyJwt(token);

    if (!payload || payload.role !== "RECRUITER" || !payload.isVerified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!recruiter) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { interviewId, status } = await req.json();

    if (!interviewId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    console.log(status);
    if (
      status !== "COMPLETED" &&
      status !== "CANCELLED" &&
      status !== "CONFIRMED"
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (interview.status === "CANCELLED" || interview.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "Status cannot be changed" },
        { status: 400 }
      );
    }

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: status },
    });

    return NextResponse.json(
      { message: "Interview completed successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
