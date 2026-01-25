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

  const upcoming = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "SCHEDULED",
    },
  });

  const completed = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "COMPLETED",
    },
  });

  const rejected = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "CANCELLED",
    },
  });

  const today = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      startAt: {
        gte: new Date(),
        lte: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
    },
  });

  return NextResponse.json(
    { upcoming, completed, rejected, today },
    { status: 200 },
  );
}

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
