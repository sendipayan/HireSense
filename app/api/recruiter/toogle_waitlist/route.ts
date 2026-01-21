import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(req: NextRequest, user: UserPayload) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json(
      { error: "Invalid job ID or candidate ID" },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: {
      id,
    },
  });

  if (!application) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  if (
    application.status === "ACCEPTED" ||
    application.status === "REJECTED" ||
    application.status === "SCHEDULED"
  ) {
    return NextResponse.json(
      { error: "Status cannot be changed" },
      { status: 400 },
    );
  }

  const updatedApplication = await prisma.application.update({
    where: {
      id,
    },
    data: {
      status: application.status === "WAITLIST" ? "PENDING" : "WAITLIST",
    },
  });

  return NextResponse.json(
    {
      message: "Application status updated successfully",
      status: updatedApplication.status,
    },
    { status: 200 },
  );
}

export const POST = withAuth(handler, { allowedRoles: ["RECRUITER"] });
