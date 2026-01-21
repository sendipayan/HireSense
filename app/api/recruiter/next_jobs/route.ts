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

  let job;
  let hasMore;
  const limit = 6;

  const recuiter = await prisma.recruiter.findUnique({
    where: {
      userId: user.userId,
    },
    select: {
      id: true,
    },
  });

  if (!recuiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  job = await prisma.postJob.findMany({
    where: {
      recruiterId: recuiter.id,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    cursor: {
      createdAt: cursor.createdAt,
      id: cursor.id,
    },
    skip: 1,
    take: limit + 1,
  });

  job = job.map((data) => {
    return JSON.parse(
      JSON.stringify(data, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );
  });

  hasMore = job.length > limit;
  job = hasMore ? job.slice(0, limit) : job;

  return NextResponse.json(
    {
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
