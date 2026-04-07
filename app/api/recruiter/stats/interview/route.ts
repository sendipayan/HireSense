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

  return `user:${userId}:recruiter:stats:interview:${hash}`;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const upcoming = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "SCHEDULED",
    },
  });

  const completed = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "COMPLETED",
    },
  });

  const rejected = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      status: "CANCELLED",
    },
  });

  const today = await prisma.interview.count({
    where: {
      recruiter: {
        userId: user.userId,
      },
      startAt: {
        gte: new Date(),
        lte: new Date(new Date().setDate(new Date().getDate() + 1)),
      },
    },
  });

  const responsePayload = { upcoming, completed, rejected, today };

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
