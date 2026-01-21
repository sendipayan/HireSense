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

  const { cursor } = await req.json();
  if (!cursor)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = 5;

  let interviews = await prisma.interview.findMany({
    where: {
      recruiterId: recruiter.id,
    },
    select: {
      id: true,
      application: {
        select: {
          candidate: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          job: {
            select: {
              title: true,
            },
          },
          resume: {
            select: {
              resumeMimeType: true,
              resumeUrl: true,
              resumeName: true,
              resumeSize: true,
              id: true,
            },
          },
        },
      },
      startAt: true,
      createdAt: true,
      duration: true,
      status: true,
      type: true,
      location: true,
      meetingLink: true,
      notes: true,
      phno: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: {
      createdAt: cursor.createdAt,
      id: cursor.id,
    },
    skip: 1,
    take: limit + 1,
  });

  const hasMore = interviews.length > limit;
  interviews = hasMore ? interviews.slice(0, limit) : interviews;

  return NextResponse.json(
    {
      interviews,
      cursor: hasMore
        ? {
            createdAt: interviews[interviews.length - 1].createdAt,
            id: interviews[interviews.length - 1].id,
          }
        : null,
      hasMore,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
