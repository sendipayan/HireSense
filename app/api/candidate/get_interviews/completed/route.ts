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
    type?: string;
    search?: string;
    cursor?: { createdAt?: string; id?: string };
    limit: number;
  },
) => {
  const normalized = {
    status: params.status ?? "",
    type: params.type ?? "",
    search: params.search ?? "",
    cursor: params.cursor
      ? { createdAt: params.cursor.createdAt ?? "", id: params.cursor.id ?? "" }
      : null,
    limit: params.limit,
  };

  const hash = createHash("sha1")
    .update(JSON.stringify(normalized))
    .digest("hex");

  return `user:${payload.userId}:candidate:get_interviews:completed:${candidateId}:${hash}`;
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

  const cacheKey = buildCacheKey(candidate.id,user, {
    status,
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

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
