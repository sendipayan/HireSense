import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "CANDIDATE")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cursor } = await req.json();
    if (!cursor)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const limit1 = 4;
    let job;
    let hasMore;

    const applied = await prisma.application.findMany({
      where: {
        candidate: {
          userId: payload.userId,
        },
      },
      select: {
        jobId: true,
      },
    });

    job = await prisma.postJob.findMany({
      where: {
        id: {
          notIn: applied.map((data) => data.jobId),
        },
      },
      include: {
        recruiter: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],

      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
      take: limit1 + 1,
    });

    job = job.map((data) => {
      return {
        ...data,
        recruiter: data.recruiter.companyName,
      };
    });

    job = job.map((data) => {
      return JSON.parse(
        JSON.stringify(data, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      );
    });

    hasMore = job.length > limit1;
    job = hasMore ? job.slice(0, limit1) : job;

    return NextResponse.json(
      {
        job,
        cursor: hasMore
          ? {
              createdAt: job[job.length - 1].createdAt,
              id: job[job.length - 1].id,
            }
          : null,
        hasMore,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
