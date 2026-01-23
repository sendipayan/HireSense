import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const recruiter = await prisma.recruiter.findUnique({
    where: {
      userId: user.userId,
    },
    select: {
      id: true,
    },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Recruiter Not Found" }, { status: 404 });
  }

  const { status, search, cursor } = await req.json();

  const limit = 6;

  let job: any;

  job = await prisma.postJob.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      recruiterId: recruiter.id,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(status && {
        status: status,
      }),
    },

    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      recruiter: {
        select: {
          companyName: true,
        },
      },
    },
    take: limit + 1,
  });

  const hasMore = job.length > limit;
  job = hasMore ? job.slice(0, limit) : job;

  job = job.map((data: any) => {
    return JSON.parse(
      JSON.stringify(data, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );
  });

  return NextResponse.json(
    {
      message: "Applications fetched successfully",
      job,
      cursor: hasMore
        ? {
            createdAt: job[job.length - 1].createdAt,
            id: job[job.length - 1].id,
          }
        : null,
      hasMore,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
