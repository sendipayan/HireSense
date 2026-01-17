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
            resumeName: true,
            resumeUrl: true,
            resumeMimeType: true,
            resumeSize: true,
            id: true,
          },
        },
      },
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
