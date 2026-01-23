import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const candidate = await prisma.candidate.findUnique({
    where: {
      userId: user.userId,
    },
    select: {
      id: true,
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate Not Found" }, { status: 404 });
  }

  const { cursor, status, search } = await req.json();

  const limit = 3;

  console.log(status);

  let applications = await prisma.application.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      candidateId: candidate?.id,
      ...(status && {
        status: status,
      }),
      ...(search && {
        OR: [
          {
            job: {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            job: {
              recruiter: {
                companyName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      }),
    },
    include: {
      job: {
        select: {
          title: true,
          id: true,
          recruiter: {
            select: {
              companyName: true,
            },
          },
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
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: limit + 1,
  });

  if (!applications) {
    return NextResponse.json(
      { error: "Applications Not Found" },
      { status: 404 },
    );
  }

  const hasMore = applications.length > limit;

  applications = hasMore ? applications.slice(0, limit) : applications;

  return NextResponse.json(
    {
      message: "Applications fetched successfully",
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

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
