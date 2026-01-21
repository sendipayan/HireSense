import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resumes = await prisma.resume.findMany({
    where: {
      candidateId: candidate.id,
    },
    select: {
      resumeName: true,
      createdAt: true,
      id: true,
      isActive: true,
      resumeUrl: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 5,
  });

  return NextResponse.json({ resumes }, { status: 200 });
}

export const GET = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
