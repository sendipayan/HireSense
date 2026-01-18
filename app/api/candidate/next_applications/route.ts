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

    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: payload.userId,
      },
      select: {
        id: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate Not Found" },
        { status: 404 },
      );
    }

    const limit = 3;

    let applications = await prisma.application.findMany({
      where: {
        candidateId: candidate?.id,
      },
      include: {
        job: {
          select: {
            title: true,
            id: true,
            recruiter: {
              select: {
                companyName: true,
              },
            },
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
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      cursor: {
        createdAt: cursor.createdAt,
        id: cursor.id,
      },
      skip: 1,
      take: limit + 1,
    });

    if (!applications) {
      return NextResponse.json(
        { error: "Applications Not Found" },
        { status: 404 },
      );
    }

    const hasMore = applications.length > limit;

    applications = hasMore ? applications.slice(0, limit) : applications;

    return NextResponse.json(
      {
        message: "Applications fetched successfully",
        applications,
        cursor: hasMore
          ? {
              createdAt: applications[applications.length - 1].createdAt,
              id: applications[applications.length - 1].id,
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
