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
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: {
      job: {
        recruiterId: recruiter.id,
      },
      status: "WAITLIST",
    },
    select: {
      id: true,
      status: true,
      score: true,
      createdAt: true,
      candidate: {
        select: {
          id: true,
          institution: true,
          experienceLevel: true,
          degree: true,
          primarySkills: true,
          secondarySkills: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      job: {
        select: {
          id: true,
          title: true,
        },
      },
      resume: {
        select: {
          id: true,
          resumeMimeType: true,
          resumeUrl: true,
          resumeName: true,
          resumeSize: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return NextResponse.json({ applications }, { status: 200 });
}

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
