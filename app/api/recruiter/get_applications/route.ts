import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
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
      status: "PENDING",
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
          user: {
            select: {
              name: true,
              profilePic: true,
            },
          },
          primarySkills: {
            select: {
              id: true,
              name: true,
            },
          },
          secondarySkills: {
            select: {
              id: true,
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
          resumeName: true,
          resumeUrl: true,
          resumeMimeType: true,
          resumeSize: true,
          id: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
    take: 3,
  });

  return NextResponse.json({ applications }, { status: 200 });
}

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
