import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status, type, search, cursor } = await req.json();

  const limit = 5;

  let interviews = await prisma.interview.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      application: {
        candidateId: candidate.id,
      },
      ...(status
        ? {
            status: status,
          }
        : {
            status: {
              in: ["COMPLETED", "CONFIRMED", "CANCELLED"],
            },
          }),
      ...(type && {
        type: type,
      }),
      ...(search && {
        OR: [
          {
            application: {
              job: {
                title: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            recruiter: {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
    },
    select: {
      id: true,
      application: {
        select: {
          job: {
            select: {
              title: true,
            },
          },
          resume: {
            select: {
              id: true,
              resumeMimeType: true,
              resumeName: true,
              resumeUrl: true,
              resumeSize: true,
            },
          },
        },
      },
      recruiter: {
        select: {
          companyName: true,
          user: {
            select: {
              name: true,
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

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
