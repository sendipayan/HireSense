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
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role != "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { status: 404 }
      );
    }

    const applications = await prisma.application.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    if (!applications) {
      return NextResponse.json(
        { error: "Applications Not Found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Applications fetched successfully", applications },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
