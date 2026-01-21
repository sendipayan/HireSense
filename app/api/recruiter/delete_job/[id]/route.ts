import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth } from "@/lib/api-middleware";

type UserPayload = {
  userId: string;
  role: string;
  isVerified?: string;
};

async function handler(
  req: NextRequest,
  user: UserPayload,
  context: { params: Promise<{ id: string }> },
) {
  if (user.isVerified !== "APPROVED") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const job = await prisma.postJob.delete({
    where: {
      id,
    },
  });
  return NextResponse.json(
    { message: "Job deleted successfully", job },
    { status: 200 },
  );
}

export const DELETE = withAuth(handler, { allowedRoles: ["RECRUITER"] });
