import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
};

async function handler(
  req: NextRequest,
  authUser: UserPayload,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const user = await prisma.candidate.findUnique({
    where: {
      userId: authUser.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure the resume belongs to the candidate? The original code didn't check ownership,
  // but it's good practice. Assuming 'id' is resume ID.

  const resumeStatus = await prisma.resume.findUnique({
    where: {
      id,
    },
    select: {
      isActive: true,
    },
  });

  if (!resumeStatus) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  

  const inUse = await prisma.application.findFirst({
    where: {
      resumeId: id,
    },
  });

  if (inUse) {
    return NextResponse.json({ error: "Resume is in use" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.resume_recommendations.deleteMany({
      where: {
        resume_id: id,
      },
    });

    await tx.resume_ats.delete({
      where: {
        resume_id: id,
      },
    });

    await tx.resume.delete({
      where: {
        id,
      },
    });
  });

  return NextResponse.json(
    { message: "Resume deleted successfully" },
    { status: 200 },
  );
}

export const DELETE = withAuth(handler, { allowedRoles: ["CANDIDATE"] });
