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

const buildCacheKey = (userId: string, isVerified: UserPayload["isVerified"]) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ userId, isVerified }))
    .digest("hex");

  return `user:${userId}:recruiter:stats:dashboard:${hash}`;
};

async function handler(req: NextRequest, user: UserPayload) {
  const cacheKey = buildCacheKey(user.userId, user.isVerified);

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

  if (user.isVerified !== "APPROVED") {
    const responsePayload = {
      jobs: 0,
      applications: 0,
      interviews: 0,
      scheduled: 0,
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

  const jobs = await prisma.postJob.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "ACTIVE",
    },
  });

  const applications = await prisma.application.count({
    where: {
      job: {
        recruiter: {
          userId: user.userId,
        },
      },
    },
  });

  const interviews = await prisma.application.aggregate({
    _avg: {
      score: true,
    },
    where: {
      job: {
        recruiter: {
          userId: user.userId,
        },
      },
    },
  });

  const scheduled = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "SCHEDULED",
    },
  });

  const responsePayload = {
    jobs,
    applications,
    interviews: interviews._avg.score,
    scheduled,
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

export const GET = withAuth(handler, { allowedRoles: ["RECRUITER"] });
