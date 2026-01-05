import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

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
    console.log(payload);

    if (!payload || payload.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const job = await prisma.postJob.findUnique({
      where: {
        id,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const applications = await prisma.application.findMany({
      where: {
        jobId: id,
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
      },
      orderBy: {
        score: "desc",
      },
      take: 3,
    });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
