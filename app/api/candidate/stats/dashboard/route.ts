import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const applications = await prisma.application.count({
    where: {
      candidate: {
        userId: user.userId,
      },
    },
  });

  const jobs = await prisma.postJob.count({
    where: {
      status: "ACTIVE",
    },
  });

  const resume = await prisma.resume.findFirst({
    where: {
      candidate: {
        userId: user.userId,
      },
      isActive: true,
    },
    select: {
      resumeScore: true,
    },
  });

  return NextResponse.json(
    { applications, jobs, resumeScore: resume?.resumeScore },
    { status: 200 },
  );
}

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
