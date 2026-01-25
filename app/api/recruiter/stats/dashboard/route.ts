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

  const jobs = await prisma.postJob.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "ACTIVE",
    },
  });

  const applications = await prisma.application.count({
    where: {
      job: {
        recruiter: {
          userId: user.userId,
        },
      },
    },
  });

  const interviews = await prisma.application.aggregate({
    _avg: {
      score: true,
    },
    where: {
      job: {
        recruiter: {
          userId: user.userId,
        },
      },
    },
  });

  const scheduled = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "SCHEDULED",
    },
  });

  return NextResponse.json(
    { jobs, applications, interviews: interviews._avg.score, scheduled },
    { status: 200 },
  );
}

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
