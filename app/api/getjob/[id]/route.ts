import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { redis } from "@/lib/redis";

const CACHE_TTL_SECONDS = 60;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const cacheKey = `getjob:id:${id}`;

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

    const job = await prisma.postJob.findUnique({
      where: {
        id,
      },
      
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    const responsePayload = { message: "Job fetched successfully", job };

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
    console.error("job fetching error: ", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
