import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: "APPROVED" | "PENDING" | "REJECTED" | true | false;
};

async function handler(
  req: NextRequest,
  user: UserPayload,
  context: { params: Promise<{ id: string }> },
) {
  if (!user.isVerified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const interview = await prisma.interview.findUnique({
    where: { id: id },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  if (interview.status === "CANCELLED" || interview.status === "CONFIRMED") {
    return NextResponse.json(
      { error: "Interview cannot be deleted" },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: interview.applicationId },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  await prisma.application.update({
    where: { id: application.id },
    data: { status: "WAITLIST" },
  });
  await prisma.interview.delete({
    where: { id: id },
  });

  return NextResponse.json(
    { message: "Interview deleted successfully" },
    { status: 200 },
  );
}

export const DELETE = withAuth(handler, { allowedRoles: ["RECRUITER"] });
