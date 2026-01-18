import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyJwt(token);
    console.log(payload);

    if (!payload || payload.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cursor } = await req.json();
    if (!cursor)
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const candidate = await prisma.candidate.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limit = 3;

    let interviews = await prisma.interview.findMany({
      where: {
        application: {
          candidateId: candidate.id,
        },
      },
      select: {
        id: true,
        application: {
          select: {
            job: {
              select: {
                title: true,
              },
            },
            resume: {
              select: {
                id: true,
                resumeMimeType: true,
                resumeName: true,
                resumeUrl: true,
                resumeSize: true,
              },
            },
          },
        },
        recruiter: {
          select: {
            companyName: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        startAt: true,
        createdAt: true,
        duration: true,
        status: true,
        type: true,
        location: true,
        meetingLink: true,
        notes: true,
        phno: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
      take: limit + 1,
    });

    const hasMore = interviews.length > limit;
    interviews = hasMore ? interviews.slice(0, limit) : interviews;

    return NextResponse.json(
      {
        interviews,
        cursor: hasMore
          ? {
              createdAt: interviews[interviews.length - 1].createdAt,
              id: interviews[interviews.length - 1].id,
            }
          : null,
        hasMore,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
