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

const buildCacheKey = (candidateId: string, limit: number, payload:UserPayload) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ candidateId, limit }))
    .digest("hex");

  return `user:${payload.userId}:candidate:get_resumes:${hash}`;
};

async function handler(req: NextRequest, user: UserPayload) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = 5;
  const cacheKey = buildCacheKey(candidate.id, limit, user);

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

  const resumes = await prisma.resume.findMany({
    where: {
      candidateId: candidate.id,
    },
    select: {
      resumeName: true,
      createdAt: true,
      id: true,
      isActive: true,
      resumeUrl: true,
      resumeScore: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
  });

  const responsePayload = { resumes };

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
