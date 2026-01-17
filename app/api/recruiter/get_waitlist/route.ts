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

    if (!payload || payload.role !== "RECRUITER" || !payload.isVerified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: payload.userId },
    });

    if (!recruiter) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          recruiterId: recruiter.id,
        },
        status: "WAITLIST",
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
            primarySkills: true,
            secondarySkills: true,
            user: {
              select: {
                name: true,
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
            id: true,
            resumeMimeType: true,
            resumeUrl: true,
            resumeName: true,
            resumeSize: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
