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
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json({ error: "Missing user Id" }, { status: 400 });
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

    const applications = await prisma.application.findMany({
      where: {
        candidateId,
      },
      select: {
        jobId: true,
      },
    });

    return NextResponse.json(
      { message: "Applications fetched successfully", applications },
      { status: 200 }
    );
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
