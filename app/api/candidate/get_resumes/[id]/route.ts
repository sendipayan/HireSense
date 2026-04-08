import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";

type UserPayload = {
  userId: string;
  role: string;
};

const CACHE_TTL_SECONDS = 60;

const buildCacheKey = (userId: string, resumeId: string, payload:UserPayload) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ userId, resumeId }))
    .digest("hex");

  return `user:${payload.userId}:candidate:get_resumes:detail:${hash}`;
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyJwt(token);
  

    if (!payload || payload.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const cacheKey = buildCacheKey(payload.userId, id, payload);

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

    const resume = await prisma.resume.findUnique({
      where: {
        id,
      },
      select: {
        resumeName: true,
        createdAt: true,
        id: true,
        isActive: true,
        resumeUrl: true,
        resumeMimeType: true,
        resumeSize: true,
        resumeScore: true,
        resume_ats: true,
        resume_recommendations: true 
      },
      
    });

    const responsePayload = { resume };

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
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
