import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

async function handler(
  req: NextRequest,
  user: { userId: string; role: string },
) {
  const body = await req.json();
  const { fileUrl, fileName, fileMime, fileSize } = body;

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: {
      id: true,
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  if (!fileUrl || !fileName || !fileMime || !fileSize) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.resume.findMany({
    where: {
      candidateId: candidate.id,
      isActive: true,
    },
  });

  let activeResume = false;

  if (existing.length === 0) {
    activeResume = true;
  }

  const resume = await prisma.resume.create({
    data: {
      candidateId: candidate.id,
      resumeUrl: fileUrl,
      resumeMimeType: fileMime,
      resumeSize: fileSize,
      resumeName: fileName,
      isActive: activeResume,
    },
  });

  return NextResponse.json(
    { message: "Resume added successfully", id: resume.id },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
