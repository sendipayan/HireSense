import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { redis } from "@/lib/redis";
import { createHash } from "crypto";

const CACHE_TTL_SECONDS = 60;

const buildCacheKey = (userId: string, jobId: string, candidateId: string) => {
  const hash = createHash("sha1")
    .update(JSON.stringify({ userId, jobId, candidateId }))
    .digest("hex");

  return `user:${userId}:recruiter:get_applications:unique:${hash}`;
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyJwt(token);
    console.log(payload);

    if (!payload || payload.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const jobId = searchParams.get("jobId");
    const candidateId = searchParams.get("candidateId");

    if (!jobId || !candidateId) {
      return NextResponse.json(
        { error: "Invalid job ID or candidate ID" },
        { status: 400 },
      );
    }

    const cacheKey = buildCacheKey(payload.userId, jobId, candidateId);

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

    const applications = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
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
        application_report:{
            select :{
              achievment: true,
              certificates: true,
              experience: true,
              primary_skill: true,
              projects: true,
              secondry_skill: true
            }
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
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
