import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
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
      { status: 400 },
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
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
