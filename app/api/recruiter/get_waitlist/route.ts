import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
};

const CACHE_TTL_SECONDS = 60;

const buildCacheKey = (
  recruiterId: string,
  payload: UserPayload,
  params: {
    search?: string;
    filter?: string;
    cursor?: { createdAt?: string; id?: string };
    limit: number;
  },
) => {
  const normalized = {
    search: params.search ?? "",
    filter: params.filter ?? "",
    cursor: params.cursor
      ? { createdAt: params.cursor.createdAt ?? "", id: params.cursor.id ?? "" }
      : null,
    limit: params.limit,
  };

  const hash = createHash("sha1")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return `user:${payload.userId}:recruiter:get_waitlist:${recruiterId}:${hash}`;
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

  const cacheKey = buildCacheKey(recruiter.id, user, {
    search,
    filter,
    cursor,
    limit,
  });

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const cachedPayload = JSON.parse(cached);
      return NextResponse.json(cachedPayload, {
        status: 200,
        headers: { "x-cache": "HIT" },
      });
    }
  } catch (err) {
    console.error("Redis GET error", err);
  }

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

  const responsePayload = {
    applications,
    cursor: hasMore
      ? {
          createdAt: applications[applications.length - 1].createdAt,
          id: applications[applications.length - 1].id,
        }
      : null,
    hasMore,
  };

  try {
    await redis.set(
      cacheKey,
      JSON.stringify(responsePayload),
      "EX",
      CACHE_TTL_SECONDS,
    );
  } catch (err) {
    console.error("Redis SET error", err);
  }

  return NextResponse.json(responsePayload, { status: 200 });
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
