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
  payload:UserPayload,
  params: {
    status?: string;
    job?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    cursor?: { createdAt?: string; id?: string };
    limit: number;
  },
) => {
  const normalized = {
    status: params.status ?? "",
    job: params.job ?? "",
    startDate: params.startDate ?? "",
    endDate: params.endDate ?? "",
    search: params.search ?? "",
    cursor: params.cursor
      ? { createdAt: params.cursor.createdAt ?? "", id: params.cursor.id ?? "" }
      : null,
    limit: params.limit,
  };

  const hash = createHash("sha1")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return `user:${payload.userId}:recruiter:get_interview:${recruiterId}:${hash}`;
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

  const { status, job, startDate, endDate, search, cursor } = await req.json();

  const limit = 5;

  const cacheKey = buildCacheKey(recruiter.id, user, {
    status,
    job,
    startDate,
    endDate,
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

  let interviews = await prisma.interview.findMany({
    ...(cursor && {
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
    }),
    where: {
      recruiterId: recruiter.id,

      ...(status && { status }),

      ...(startDate || endDate
        ? {
            startAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),

      ...(job || search
        ? {
            application: {
              ...(job && { jobId: job }),
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
            },
          }
        : {}),
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = interviews.length > limit;
  interviews = hasMore ? interviews.slice(0, limit) : interviews;

  const responsePayload = {
    interviews,
    cursor: hasMore
      ? {
          createdAt: interviews[interviews.length - 1].createdAt,
          id: interviews[interviews.length - 1].id,
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
