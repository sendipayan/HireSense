import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";
import { id } from "date-fns/locale";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";

type UserPayload = {
  userId: string;
  role: string;
};

const CACHE_TTL_SECONDS = 60;

const buildCacheKey = (
  recruiterId: string,
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

  return `user:${payload.userId}:recruiter:getjob:${recruiterId}:${hash}`;
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

  const cacheKey = buildCacheKey(recruiter.id, user, {
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
      _count:{
        select:{
          applications:true   
        }
      }
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

  const responsePayload = {
    message: "Applications fetched successfully",
    job,
    cursor: hasMore
      ? {
          createdAt: job[job.length - 1].createdAt,
          id: job[job.length - 1].id,
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
