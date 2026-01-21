import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interviewId, date, time } = await req.json();

  if (!interviewId || !date || !time) {
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
    interview.status === "CANCELLED" ||
    interview.status === "CONFIRMED" ||
    interview.status === "COMPLETED"
  ) {
    return NextResponse.json(
      { error: "Cannot reschedule completed interviews" },
      { status: 400 },
    );
  }

  const toISO = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);

    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    return combined.toISOString();
  };

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      startAt: toISO(new Date(date), time),
    },
  });

  return NextResponse.json(
    { message: "Interview rescheduled successfully" },
    { status: 200 },
  );
}

export const PATCH = withAuth(handler, { allowedRoles: ["RECRUITER"] });
