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

const buildCacheKey = (recruiterId: string, limit: number, payload:UserPayload) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ limit }))
    .digest("hex");

  return `user:${payload.userId}:recruiter:get_applications:${recruiterId}:${hash}`;
};

async function handler(req: NextRequest, user: UserPayload) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = 3;
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

  const applications = await prisma.application.findMany({
    where: {
      job: {
        recruiterId: recruiter.id,
      },
      status: "PENDING",
    },
    select: {
      id: true,
      status: true,
      score: true,
      createdAt: true,
      candidate: {
        select: {
          id: true,
          institution: true,
          experienceLevel: true,
          degree: true,
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
          id: true,
          title: true,
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
    orderBy: {
      score: "desc",
    },
    take: limit,
  });

  const responsePayload = { applications };

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
