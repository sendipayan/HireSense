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

  const { search, filter, cursor } = await req.json();

  const limit = 5;

  let applications = await prisma.application.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      job: {
        recruiterId: recruiter.id,
      },
      status: "WAITLIST",
      ...(search && {
        candidate: {
          user: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      }),
      ...(filter && {
        jobId: filter,
      }),
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
    orderBy: [
      {
        createdAt: "desc",
      },
      { id: "desc" },
    ],
    take: limit + 1,
  });

  const hasMore = applications.length > limit;
  applications = hasMore ? applications.slice(0, limit) : applications;

  return NextResponse.json(
    {
      applications,
      cursor: hasMore
        ? {
            createdAt: applications[applications.length - 1].createdAt,
            id: applications[applications.length - 1].id,
          }
        : null,
      hasMore,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
