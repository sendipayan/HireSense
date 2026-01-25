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
    select: { id: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let interviews = await prisma.interview.findMany({
    where: {
      recruiterId: recruiter.id,
      status: "SCHEDULED",
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
                  profilePic: true,
                },
              },
            },
          },
          job: {
            select: {
              title: true,
            },
          },
          jobId: true,
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
    orderBy: { startAt: "asc" },
    take: 2,
  });

  return NextResponse.json(
    {
      interviews,
    },
    { status: 200 },
  );
}

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
