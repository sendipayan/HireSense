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

const buildCacheKey = (recruiterId: string, limit: number, payload: UserPayload) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ recruiterId, limit }))
    .digest("hex");

  return `user:${payload.userId}:recruiter:get_interview:scheduled:${hash}`;
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

  const limit = 2;
  const cacheKey = buildCacheKey(recruiter.id, limit, user);

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
    where: {
      recruiterId: recruiter.id,
      status: "SCHEDULED",
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
    orderBy: { startAt: "asc" },
    take: limit,
  });

  const responsePayload = { interviews };

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

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
