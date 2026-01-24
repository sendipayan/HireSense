import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(
  req: NextRequest,
  user: UserPayload,
  context: { params: Promise<{ id: string }> },
) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const { search, cursor } = await req.json();

  const job = await prisma.postJob.findUnique({
    where: {
      id,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const limit = 3;
  const tokens = search?.map((s: string) => s.toLowerCase());

  const nameConditions = tokens?.map((token: string) => ({
    candidate: {
      user: {
        name: {
          contains: token,
          mode: "insensitive",
        },
      },
    },
  }));

  const skillConditions = tokens?.length
    ? [
        {
          candidate: {
            primarySkills: {
              array_contains: tokens,
            },
          },
        },
        {
          candidate: {
            secondarySkills: {
              array_contains: tokens,
            },
          },
        },
      ]
    : [];

  let applications = await prisma.application.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      jobId: id,
      status: "PENDING",
      ...(search.length > 0 && { OR: [...nameConditions, ...skillConditions] }),
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
          resumeName: true,
          resumeUrl: true,
          resumeMimeType: true,
          resumeSize: true,
          id: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
