import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";

type UserPayload = {
  userId: string;
  role: string;
};

const CACHE_TTL_SECONDS = 60;

const buildCacheKey = (
  candidateId: string,
  payload:UserPayload,
  params: {
    status?: string;
    search?: string;
    cursor?: { createdAt?: string; id?: string };
    limit: number;
  },
) => {
  const normalized = {
    status: params.status ?? "",
    search: params.search ?? "",
    cursor: params.cursor
      ? { createdAt: params.cursor.createdAt ?? "", id: params.cursor.id ?? "" }
      : null,
    limit: params.limit,
  };

  const hash = createHash("sha1")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return `user:${payload.userId}:candidate:get_applications:${candidateId}:${hash}`;
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

  

  const cacheKey = buildCacheKey(candidate.id,user, {
    status,
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

  const responsePayload = {
    message: "Applications fetched successfully",
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

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
