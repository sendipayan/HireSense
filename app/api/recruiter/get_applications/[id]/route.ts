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

const normalizeArray = (value?: string[]) => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((v) => v.toLowerCase()))).sort();
};

const buildCacheKey = (
  recruiterId: string,
  payload:UserPayload,
  params: {
    jobId: string;
    search?: string[];
    cursor?: { createdAt?: string; id?: string };
    limit: number;
  },
) => {
  const normalized = {
    jobId: params.jobId,
    search: normalizeArray(params.search),
    cursor: params.cursor
      ? { createdAt: params.cursor.createdAt ?? "", id: params.cursor.id ?? "" }
      : null,
    limit: params.limit,
  };

  const hash = createHash("sha1")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return `user:${payload.userId}:recruiter:get_applications:job:${recruiterId}:${hash}`;
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

  const cacheKey = buildCacheKey(recruiter.id, user, {
    jobId: id,
    search,
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
