import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
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

  if (status === "COMPLETED") {
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "COMPLETED" },
    });
  } else if (status === "CANCELLED") {
    await prisma.$transaction([
      prisma.interview.update({
        where: { id: interviewId },
        data: { status: "CANCELLED" },
      }),
      prisma.application.update({
        where: { id: interview.applicationId },
        data: { status: "REJECTED" },
      }),
    ]);
  } else if (status === "CONFIRMED") {
    await prisma.$transaction([
      prisma.interview.update({
        where: { id: interviewId },
        data: { status: "CONFIRMED" },
      }),
      prisma.application.update({
        where: { id: interview.applicationId },
        data: { status: "ACCEPTED" },
      }),
    ]);
  }

  try {
    const keys = await redis.keys(`user:${user.userId}:recruiter:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error("Redis cache update error", err);
  }

  return NextResponse.json(
    { message: "Interview completed successfully" },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
