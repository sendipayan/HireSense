import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (!user.isVerified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interviewId, status } = await req.json();

  if (!interviewId || !status) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

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
      { status: 400 },
    );
  }

  await prisma.interview.update({
    where: { id: interviewId },
    data: { status: status },
  });

  return NextResponse.json(
    { message: "Interview completed successfully" },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
