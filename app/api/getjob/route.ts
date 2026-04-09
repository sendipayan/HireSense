import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { redis } from "@/lib/redis";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
};

const CACHE_TTL_SECONDS = 60;

async function handler(req: NextRequest, user: UserPayload) {
  const cacheKey =
    user.role === "RECRUITER"
      ? `user:${user.userId}:getjob:list`
      : "role:candidate:getjob:list";

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

  if (user.role === "RECRUITER") {
    const job = await prisma.postJob.findMany({
      where: {
        recruiter: {
          userId: user.userId,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });
    const responsePayload = { job };

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

    return NextResponse.json(responsePayload);
  } else {
    const job = await prisma.postJob.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        title: true,
      },
    });
    const responsePayload = { job };

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

    return NextResponse.json(responsePayload);
  }
}

export const GET = withAuth(handler, {
  allowedRoles: ["RECRUITER", "CANDIDATE"],
});
