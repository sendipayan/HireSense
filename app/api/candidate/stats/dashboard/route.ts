import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
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

  const present = await prisma.resume.findFirst({
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

  const interviews= await prisma.interview.count({
    where:{
      application:{
        candidate:{
          userId: user.userId
        }
      }
    }
  })

  const resumeScore = present?.resumeScore ?? 0


  return NextResponse.json(
    { applications, jobs, resumeScore,interviews },
    { status: 200 },
  );
}

export const GET = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
