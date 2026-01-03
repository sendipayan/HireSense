import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, candidateId } = body;

    if (!jobId || !candidateId) {
      return NextResponse.json(
        { error: "Missing user Id or job Id or both" },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: {
        id: candidateId,
      },
      select: {
        isVerified: true,
      },
    });

    if (!candidate?.isVerified) {
      return NextResponse.json(
        {
          error:
            "Candidate is not verified yet. Please verify your profile first",
        },
        { status: 400 }
      );
    }

    const job = await prisma.postJob.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!candidate || !job) {
      return NextResponse.json(
        { error: "Job or Candidate Not Found" },
        { status: 404 }
      );
    }

    const findApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
    });

    if (findApplication) {
      return NextResponse.json(
        { error: "Application already exists" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId,
      },
    });

    return NextResponse.json(
      { message: "Application submitted successfully", application },
      { status: 201 }
    );
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
