import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
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

    const candidate = await prisma.candidate.findUnique({
      where: { userId: payload.userId },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await prisma.interview.findMany({
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
        duration: true,
        status: true,
        type: true,
        location: true,
        meetingLink: true,
        notes: true,
        phno: true,
      },
      orderBy: {
        startAt: "asc",
      },
      take: 10,
    });

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
