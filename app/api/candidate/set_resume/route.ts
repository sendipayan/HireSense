import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  const body = await req.json();
  const { id } = body;

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: {
      id: true,
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const existing = await prisma.resume.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  // First deactivate all resumes for this candidate
  await prisma.resume.updateMany({
    where: {
      candidateId: candidate.id,
    },
    data: {
      isActive: false,
    },
  });

  // Then activate the selected resume
  const resume = await prisma.resume.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });

  return NextResponse.json(
    { message: "Resume set successfully", id: resume.id },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
