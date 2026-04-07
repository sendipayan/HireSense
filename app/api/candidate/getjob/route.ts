import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";

type UserPayload = {
  userId: string;
  role: string;
};

type JobWithRecruiter = Prisma.PostJobGetPayload<{
  include: {
    recruiter: {
      select: {
        companyName: true;
      };
    };
  };
}>;

const CACHE_TTL_SECONDS = 60;

const normalizeArray = (value?: string[]) => {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value)).sort();
};

const buildCacheKey = (candidateId: string, payload:UserPayload, params: {
  department?: string[];
  experience?: string[];
  type?: string[];
  search?: string;
  cursor?: { createdAt?: string; id?: string };
  limit: number;
}) => {
  const normalized = {
    department: normalizeArray(params.department),
    experience: normalizeArray(params.experience),
    type: normalizeArray(params.type),
    search: params.search ?? "",
    cursor: params.cursor
      ? { createdAt: params.cursor.createdAt ?? "", id: params.cursor.id ?? "" }
      : null,
    limit: params.limit,
  };

  const hash = createHash("sha1")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return `user:${payload.userId}:candidate:getjob:${candidateId}:${hash}`;
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

  const { department, experience, type, search, cursor } = await req.json();

  const limit = 4;

  const cacheKey = buildCacheKey(candidate.id, user, {
    department,
    experience,
    type,
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
    where: {
      candidateId: candidate?.id,
    },
    select: {
      jobId: true,
    },
  });

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
      id: { notIn: applications.map((data) => data.jobId) },
      status: "ACTIVE",
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
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
      ...(department?.length > 0 && {
        department: {
          in: department,
        },
      }),
      ...(experience?.length > 0 && {
        experienceRequired: {
          in: experience,
        },
      }),
      ...(type?.length > 0 && {
        jobType: {
          in: type,
        },
      }),
    },

    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      recruiter: {
        select: {
          companyName: true,
        },
      }
    },
    take: limit + 1,
  });
  job = job.map((data: JobWithRecruiter) => {
    return {
      ...data,
      recruiter: data.recruiter.companyName,
    };
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

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
