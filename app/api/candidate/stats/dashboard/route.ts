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

const buildCacheKey = (userId: string) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ userId }))
    .digest("hex");

  return `user:${userId}:candidate:stats:dashboard:${hash}`;
};

async function handler(req: NextRequest, user: UserPayload) {
  const cacheKey = buildCacheKey(user.userId);

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

  const applications = await prisma.application.count({
    where: {
      candidate: {
        userId: user.userId,
      },
    },
  });

  const jobs = await prisma.postJob.count({
    where: {
      status: "ACTIVE",
    },
  });

  const present = await prisma.resume.findFirst({
    where: {
      candidate: {
        userId: user.userId,
      },
      isActive: true,
    },
    select: {
      resumeScore: true,
    },
  });

  const interviews= await prisma.interview.count({
    where:{
      application:{
        candidate:{
          userId: user.userId
        }
      }
    }
  })

  const resumeScore = present?.resumeScore ?? 0

  const responsePayload = { applications, jobs, resumeScore, interviews };

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

export const GET = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
