import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, type UserPayload } from "@/lib/api-middleware";

async function handler(req: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { cursor } = await req.json();
  if (!cursor) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = 5;

  let applications = await prisma.application.findMany({
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
    cursor: {
      createdAt: cursor.createdAt,
      id: cursor.id,
    },
    skip: 1,
    take: limit + 1,
  });

  const hasMore = applications.length > limit;
  applications = hasMore ? applications.slice(0, limit) : applications;

  return NextResponse.json(
    {
      applications,
      cursor: {
        createdAt: applications[applications.length - 1].createdAt,
        id: applications[applications.length - 1].id,
      },
      hasMore,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
